import pydicom
import matplotlib.pyplot as plt

def read_dcm(filepath):
    ds = pydicom.dcmread(filepath)

    print("Scan MetaData: ", ds)

    image = ds.pixel_array
    plt.imshow(image)
    plt.axis("off")
    plt.title("DICOM Image")
    plt.show()

    return ds

filepath = "./Atelectasis/train/0b1b897b1e1e170f1b5fd7aeff553afa.dcm"

read_dcm(filepath)