import os 
from hopprai import HOPPR

api_key = os.getenv("HOPPR_API_KEY")

hoppr = HOPPR("RmTQz4CowITpnjNdBAFbvjRaMlyARl9g3WUWVIhu")

study_id = "a3f1d5c2-41d4-4c9a-8b8f-8e5f9a4e8f9a"
model = "mc_chestradiography_lung_nodule_or_mass:v1.20250828"
prompt = "What findings are present in this study?"

response = hoppr.prompt_model(study_id, model, prompt, organization = "hoppr")
if response:
  print(f"Model response: {response.response}")
else:
  print("Model inference timed out or failed.")