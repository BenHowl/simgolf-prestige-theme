
import { GoogleGenAI, Type } from "@google/genai";

const getRecommendation = async (
    apiKey,
    width, 
    height, 
    depth, 
    budget, 
    skill,
    allProducts
) => {
  if (!apiKey) {
      throw new Error("API Key is missing. Please configure it in the theme settings.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const productList = allProducts.map(p => `- ${p.title} (Price: ${p.price}, Min Dimensions: ${p.metafields.min_width || 'N/A'}'W x ${p.metafields.min_height || 'N/A'}'H x ${p.metafields.min_depth || 'N/A'}'D)`).join('\n');
    
  const prompt = `
    Act as a helpful and friendly golf simulator expert at "SimGolf Prestige". A customer is looking for a complete golf simulator package.
    
    Customer's requirements:
    - Available Room Dimensions (in feet): ${width}' Width x ${height}' Height x ${depth}' Depth
    - Budget: Up to $${budget}
    - Their Skill Level: ${skill}

    Available products (with their minimum required dimensions):
    ${productList}

    Your task:
    1.  Analyze the customer's requirements, paying close attention to their room dimensions and budget.
    2.  Recommend the SINGLE best product from the list that fits WITHIN their specified dimensions and budget. The product's minimum required dimensions must be less than or equal to the customer's available room dimensions.
    3.  In a concise, encouraging, and luxurious tone, explain why your choice is the perfect fit for their space, budget, and skill level. Mention the product name clearly in your justification.
    4.  If no product perfectly fits the budget or dimensions, recommend the closest option and briefly explain the trade-offs (e.g., "While slightly over budget, the 'Pro Tour' offers unparalleled accuracy for your skill level..."). If no product fits at all, politely explain that and suggest they contact support for custom solutions.

    Provide your response in the specified JSON format.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommended_product_name: {
              type: Type.STRING,
              description: 'The name of the recommended product. If none fit, state "No suitable package found".'
            },
            justification: {
              type: Type.STRING,
              description: 'A detailed, friendly explanation for why this product was recommended or why no product was suitable.'
            }
          },
          required: ["recommended_product_name", "justification"]
        },
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching recommendation from Gemini API:", error);
    // Provide a more specific error message based on the error type
    let errorMessage = "We couldn't generate a recommendation at this time. Please try again later.";
    if (error.message.includes('API key')) {
        errorMessage = "The AI Recommender is not configured correctly. The API key is invalid or missing.";
    }
    return JSON.stringify({
        recommended_product_name: "Error",
        justification: errorMessage
    });
  }
};

class AiRecommender {
    constructor(sectionElement) {
        this.section = sectionElement;
        this.form = this.section.querySelector('.ai-form');
        this.submitButton = this.section.querySelector('.ai-submit-button');
        this.resultContainer = this.section.querySelector('.ai-result');
        this.sectionId = this.section.dataset.sectionId;
        
        const productsDataEl = document.getElementById(`AiProducts-${this.sectionId}`);
        this.products = productsDataEl ? JSON.parse(productsDataEl.textContent) : [];

        const apiKeyEl = document.getElementById(`GeminiApiKey-${this.sectionId}`);
        this.apiKey = apiKeyEl ? apiKeyEl.textContent : null;

        if (this.form) {
          this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `<svg class="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Analyzing...</span>`;
            this.resultContainer.innerHTML = `<p class="text-zinc-400 text-center">Our AI expert is analyzing the perfect fit for you...</p>`;
            this.resultContainer.classList.remove('opacity-0', 'hidden');
            this.resultContainer.classList.add('opacity-100');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = 'Get My Recommendation';
        }
    }

    renderResult(result) {
        const recommendedProduct = this.products.find(p => p.title === result.recommended_product_name);
        
        let productHTML = '';
        if (recommendedProduct) {
             productHTML = `
                <div class="border border-zinc-700 bg-zinc-800/50 rounded-lg p-6 mt-6 flex flex-col sm:flex-row items-center gap-6 text-left">
                    <img src="${recommendedProduct.image}" alt="${recommendedProduct.title}" class="w-32 h-32 object-cover rounded-md flex-shrink-0">
                    <div>
                        <h4 class="text-xl font-bold font-serif text-white">${recommendedProduct.title}</h4>
                        <p class="text-zinc-400 text-sm mb-2">${recommendedProduct.price}</p>
                        <a href="${recommendedProduct.url}" class="text-emerald-400 hover:text-emerald-300 transition-colors">View Product &rarr;</a>
                    </div>
                </div>
            `;
        }


        if (result.recommended_product_name === "Error") {
            this.resultContainer.innerHTML = `<div class="text-center text-red-400"><h4 class="font-bold mb-2">An Error Occurred</h4><p>${result.justification}</p></div>`;
        } else {
            this.resultContainer.innerHTML = `
                <div class="text-center transition-opacity duration-500">
                    <p class="text-zinc-400 text-sm mb-2">Our AI Expert Recommends</p>
                    <h3 class="text-3xl font-serif font-bold text-emerald-400 mb-4">${result.recommended_product_name}</h3>
                    <p class="text-zinc-300 max-w-2xl mx-auto">${result.justification}</p>
                    ${productHTML}
                 </div>
            `;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setLoading(true);

        const formData = new FormData(this.form);
        const width = formData.get('width');
        const height = formData.get('height');
        const depth = formData.get('depth');
        const budget = formData.get('budget');
        const skill = formData.get('skill');

        try {
            const resultString = await getRecommendation(
                this.apiKey,
                Number(width),
                Number(height),
                Number(depth),
                Number(budget),
                skill,
                this.products
            );
            // Handle cases where the response might not be valid JSON
            let parsedResult;
            try {
                parsedResult = JSON.parse(resultString);
            } catch (e) {
                console.error("Failed to parse JSON response:", resultString);
                throw new Error("The AI returned an invalid response. Please try again.");
            }
            this.renderResult(parsedResult);
        } catch (e) {
            console.error(e);
            this.renderResult({
                recommended_product_name: "Error",
                justification: e.message || 'An unexpected error occurred. Please check the console for details.'
            });
        } finally {
            this.setLoading(false);
        }
    }
}

document.addEventListener('shopify:section:load', function(event) {
    const section = event.target;
    if (section.classList.contains('ai-recommender-section')) {
        new AiRecommender(section);
    }
});

document.querySelectorAll('.ai-recommender-section').forEach(section => {
    new AiRecommender(section);
});
