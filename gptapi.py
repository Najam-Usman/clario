# gptapi.py
from openai import OpenAI
from pipeline import run_pipeline
import sys
import os

PROMPT_ID = "pmpt_690700ab592c8193a7c32f25f1e388af060c97f980a6ee4d"
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # if python-dotenv not installed, it's fine, we'll just rely on OS env vars
    pass

def _extract_response_text(resp) -> str:
    """Try common spots in the Responses API object/dict to get plain text."""
    try:
        out = getattr(resp, "output", None)
        if out:
            parts = []
            for item in out:
                content = getattr(item, "content", None) or (item.get("content", []) if isinstance(item, dict) else None)
                if content:
                    for c in content:
                        t = getattr(c, "text", None) or (c.get("text") if isinstance(c, dict) else None)
                        if t:
                            parts.append(t)
            if parts:
                return "".join(parts)
    except Exception:
        pass

    # dict-like with choices/output
    try:
        if isinstance(resp, dict):
            if "output" in resp:
                texts = []
                for item in resp["output"]:
                    for c in item.get("content", []):
                        if isinstance(c, dict) and "text" in c:
                            texts.append(c["text"])
                if texts:
                    return "".join(texts)
            if "choices" in resp:
                texts = []
                for c in resp["choices"]:
                    txt = c.get("text") or c.get("message", {}).get("content")
                    if isinstance(txt, list):
                        for block in txt:
                            if isinstance(block, dict) and "text" in block:
                                texts.append(block["text"])
                    elif txt:
                        texts.append(txt)
                if texts:
                    return "\n".join(texts)
    except Exception:
        pass

    # last resort
    try:
        return str(resp)
    except Exception:
        return ""


def main(dicom_path: str | None = None):
    # 1) figure out DICOM path
    if dicom_path is None:
        # your original default
        dicom_path = "Atelectasis/train/0b1b897b1e1e170f1b5fd7aeff553afa.dcm"

    if not os.path.exists(dicom_path):
        raise FileNotFoundError(f"DICOM file not found at: {dicom_path}")

    # 2) run the hoppr pipeline and get the big text
    formatted_output = run_pipeline(dicom_path)

    # 3) send to OpenAI Responses w/ your saved prompt
    client = OpenAI()

    # IMPORTANT:
    # Your example call shows this shape:
    #   responses.create(prompt={id:...,version:"1"}, input=[], ...)
    # I’m keeping that, but I’m putting your pipeline text
    # into the `input` as a proper user message.
    response = client.responses.create(
        prompt={
            "id": PROMPT_ID,
            "version": "1",
        },
        # we send ONE message: "here is the chest x-ray analysis we just made"
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": formatted_output,
                    }
                ],
            }
        ],
        text={
            "format": {
                "type": "text"
            }
        },
        reasoning={},
        max_output_tokens=2048,
        store=True,
        include=["web_search_call.action.sources"],
    )

    text = _extract_response_text(response)

    print("\n=== GPT MODEL OUTPUT ===\n")
    print(text)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    main(path)
