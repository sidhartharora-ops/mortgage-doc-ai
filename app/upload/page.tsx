import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Upload Document</h2>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
        Upload a Canadian mortgage document for automated classification, extraction, and validation.
      </p>
      <UploadForm />
    </div>
  );
}
