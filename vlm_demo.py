import argparse
from hopprai import HOPPR
import json

# Parse command line arguments
parser = argparse.ArgumentParser(description="Run HOPPR inference on a DICOM file.")
parser.add_argument("dicom_path", type=str, help="Path to the DICOM file")
args = parser.parse_args()

# Initialize the SDK
api_key = "RmTQz4CowITpnjNdBAFbvjRaMlyARl9g3WUWVIhu"
hoppr = HOPPR(api_key=api_key, base_url="https://api.hoppr.ai")

# Create a study
study = hoppr.create_study("my-study-reference-123")
print(f"Created study: {study.id}")

# Add an image to the study
with open(args.dicom_path, "rb") as f:
    image_data = f.read()

image = hoppr.add_study_image(study.id, "image-001", image_data)
print(f"Added image: {image.id}")

model_id = "cxr-vlm-experimental"
response = hoppr.prompt_model(study.id, model_id, "Provide a description of the findings in the radiology image.", response_format="json")

if response:
    print(f"Inference successful: {response.success}")
    # Pretty-print the response data for better readability
    if hasattr(response, "to_dict"):
        response_data = response.to_dict()
    elif hasattr(response, "__dict__"):
        response_data = response.__dict__
    else:
        response_data = response

    print("Response data:")
    print(json.dumps(response_data, indent=4, sort_keys=True, default=str))
else:
    print("Inference timed out")

