import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert agricultural weed identification system. Analyze the provided image of a field or plant and identify any weeds present.

You MUST respond by calling the "classify_weeds" function with your analysis results. Be as accurate as possible based on visual features like leaf shape, growth pattern, stem structure, and flower characteristics.

For each weed detected, provide a bounding box as normalized coordinates (0-1 range relative to image dimensions):
- x: left edge of the bounding box (0 = left, 1 = right)
- y: top edge of the bounding box (0 = top, 1 = bottom)
- width: width of the box as fraction of image width
- height: height of the box as fraction of image height

If the image does not contain plants or weeds, still call the function but with weedCount: 0, infestationRate: 0, empty species array, and empty boundingBoxes array.

Common agricultural weeds to look for include:
- Amaranthus retroflexus (Redroot Pigweed)
- Cyperus rotundus (Purple Nutsedge)
- Echinochloa crus-galli (Barnyardgrass)
- Digitaria sanguinalis (Large Crabgrass)
- Portulaca oleracea (Common Purslane)
- Chenopodium album (Lambsquarters)
- Convolvulus arvensis (Field Bindweed)
- Setaria viridis (Green Foxtail)
- Sorghum halepense (Johnsongrass)
- Cirsium arvense (Canada Thistle)`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image. Identify all weed species visible, estimate the weed count, calculate the infestation rate, and provide bounding boxes around each detected weed. Each bounding box should use normalized coordinates (0-1) relative to image dimensions.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "classify_weeds",
                description:
                  "Return structured weed classification results with bounding boxes from the image analysis.",
                parameters: {
                  type: "object",
                  properties: {
                    weedCount: {
                      type: "number",
                      description: "Total number of individual weed plants detected",
                    },
                    infestationRate: {
                      type: "number",
                      description:
                        "Estimated percentage of the visible area covered by weeds (0-100)",
                    },
                    species: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Scientific name of the weed species",
                          },
                          count: {
                            type: "number",
                            description: "Number of this species detected",
                          },
                          percentage: {
                            type: "number",
                            description:
                              "Percentage this species represents of total weeds",
                          },
                        },
                        required: ["name", "count", "percentage"],
                        additionalProperties: false,
                      },
                    },
                    boundingBoxes: {
                      type: "array",
                      description: "Bounding boxes for each detected weed",
                      items: {
                        type: "object",
                        properties: {
                          x: {
                            type: "number",
                            description: "Left edge normalized (0-1)",
                          },
                          y: {
                            type: "number",
                            description: "Top edge normalized (0-1)",
                          },
                          width: {
                            type: "number",
                            description: "Width normalized (0-1)",
                          },
                          height: {
                            type: "number",
                            description: "Height normalized (0-1)",
                          },
                          label: {
                            type: "string",
                            description: "Species name for this detection",
                          },
                          confidence: {
                            type: "number",
                            description: "Confidence score 0-1",
                          },
                        },
                        required: ["x", "y", "width", "height", "label", "confidence"],
                        additionalProperties: false,
                      },
                    },
                    summary: {
                      type: "string",
                      description:
                        "Brief text summary of the analysis findings",
                    },
                  },
                  required: ["weedCount", "infestationRate", "species", "boundingBoxes", "summary"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "classify_weeds" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "AI did not return structured results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-weed error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
