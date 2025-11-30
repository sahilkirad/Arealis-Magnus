"use client";

import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardDivider, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { fetchDemo } from "@/lib/demo-api";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

const REQUIRED_COLUMNS = [
  "date",
  "vendor_id",
  "vendor_name",
  "amount",
  "currency",
  "payment_method",
  "bank_name",
  "gst_number",
  "pan_number",
  "payment_purpose",
  "receiving_bank",
  "receiving_account",
  "country",
];

const BANK_CONFIGS = [
  { id: "hdfc", label: "HDFC Bank", placeholder: "Enter HDFC API Key" },
  { id: "icici", label: "ICICI Bank", placeholder: "Enter ICICI API Key" },
  { id: "axis", label: "Axis Bank", placeholder: "Enter Axis API Key" },
  { id: "kotak", label: "Kotak Bank", placeholder: "Enter Kotak API Key" },
];

const DEMO_ENDPOINT = "https://httpbin.org/anything/arealis-magnus-demo";

type ToastTone = "info" | "success" | "warning" | "error";
type TagTone = "default" | ToastTone;

interface ToastState {
  message: string;
  tone: ToastTone;
}

interface ConnectionResult {
  endpoint: string;
  status?: number;
  ok: boolean;
  timestamp: string;
  header?: string;
  message?: string;
}

export default function IngestPage() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [uploadStatus, setUploadStatus] = useState<ToastState | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    setToast({ message, tone });
  }, []);

  const handleKeyboardActivate = useCallback(
    (handler: () => void) => (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      if (event.currentTarget instanceof HTMLButtonElement) {
        return;
      }

      event.preventDefault();
      handler();
    },
    []
  );

  const handleBrowseFiles = useCallback(() => {
    console.log("[ingest] Browse files clicked");
    showToast("File picker opened. Select a CSV to continue.", "info");
    fileInputRef.current?.click();
  }, [showToast]);

  const handleDownloadSample = useCallback(() => {
    console.log("[ingest] Download sample requested");
    showToast("Sample CSV download is coming soon.", "warning");
  }, [showToast]);

  const handleViewFormatGuide = useCallback(() => {
    console.log("[ingest] View format guide requested");
    showToast("Format guide will be shared shortly. Contact support for details.", "info");
  }, [showToast]);

  const handleOAuthLogin = useCallback(() => {
    console.log("[ingest] Login with bank OAuth");
    showToast("OAuth login is mocked in this sandbox build.", "info");
  }, [showToast]);

  const handleSetupLiveApi = useCallback(() => {
    console.log("[ingest] Setup live API requested");
    showToast("Live API provisioning is disabled in the demo environment.", "warning");
  }, [showToast]);

  const handleCancel = useCallback(() => {
    console.log("[ingest] Cancel ingestion session");
    showToast("Session cancelled. You can restart whenever you are ready.", "info");
  }, [showToast]);

  const handleFileSelection = useCallback(
    (file: File | null | undefined) => {
      if (!file) {
        setUploadStatus({ message: "No file detected. Try again.", tone: "warning" });
        showToast("No file detected. Try again.", "warning");
        return;
      }

      const sizeInKb = Math.max(file.size / 1024, 1);
      console.log("[ingest] File queued", { name: file.name, size: file.size });

      setUploadStatus({
        message: `Queued ${file.name} (${sizeInKb.toFixed(0)} KB) for validation.`,
        tone: "info",
      });
      showToast(`${file.name} queued for ingestion.`, "success");
    },
    [showToast]
  );

  const handleUploadCsv = useCallback(() => {
    console.log("[ingest] Upload CSV confirmed");
    showToast("Uploading CSV… watch the status tiles for progress.", "info");
    setUploadStatus({ message: "Upload in progress…", tone: "info" });

    window.setTimeout(() => {
      setUploadStatus({ message: "Upload completed successfully.", tone: "success" });
      showToast("CSV uploaded. Validation runs automatically.", "success");
    }, 1600);
  }, [showToast]);

  const handleDropzoneClick = useCallback(() => {
    handleBrowseFiles();
  }, [handleBrowseFiles]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      handleFileSelection(file ?? null);
    },
    [handleFileSelection]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      handleFileSelection(file ?? null);
      event.target.value = "";
    },
    [handleFileSelection]
  );

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    showToast("Testing connection via demo endpoint…", "info");

    try {
      const response = await fetchDemo(DEMO_ENDPOINT);
      const data = await response.json();
      const echoedAuthorization = data?.headers?.Authorization as string | undefined;
      const timestamp = new Date().toISOString();

      const result: ConnectionResult = {
        endpoint: DEMO_ENDPOINT,
        status: response.status,
        ok: response.ok,
        timestamp,
        header: echoedAuthorization,
        message: response.ok
          ? "Remote endpoint accepted the Authorization header."
          : data?.message ?? "Response returned a non-200 status.",
      };

      setConnectionResult(result);

      if (response.ok) {
        showToast("Connection succeeded. Inspect the Network tab for the Authorization header.", "success");
      } else {
        showToast(`Test completed with status ${response.status}.`, "warning");
      }
    } catch (error) {
      console.error("[ingest] Connection test failed", error);
      const timestamp = new Date().toISOString();

      setConnectionResult({
        endpoint: DEMO_ENDPOINT,
        ok: false,
        timestamp,
        message: error instanceof Error ? error.message : "Unknown error connecting to endpoint.",
      });

      showToast("Unable to reach the demo endpoint. Check your internet connection.", "error");
    } finally {
      setIsTestingConnection(false);
    }
  }, [showToast]);

  const toastToneClass = useMemo(() => {
    if (!toast) {
      return undefined;
    }

    switch (toast.tone) {
      case "success":
        return styles.toastSuccess;
      case "warning":
        return styles.toastWarning;
      case "error":
        return styles.toastError;
      default:
        return undefined;
    }
  }, [toast]);

  const maskedAuthorization = useMemo(() => {
    const header = connectionResult?.header;

    if (!header) {
      return null;
    }

    if (!header.startsWith("Bearer ")) {
      return header;
    }

    const token = header.slice(7);
    if (token.length <= 8) {
      return header;
    }

    const visibleStart = token.slice(0, 20);
    const visibleEnd = token.slice(-3);

    return `Bearer ${visibleStart}***${visibleEnd}`;
  }, [connectionResult?.header]);

  const formattedTimestamp = useMemo(() => {
    if (!connectionResult?.timestamp) {
      return null;
    }

    return new Date(connectionResult.timestamp).toLocaleString();
  }, [connectionResult?.timestamp]);

  const connectionTone: TagTone = useMemo(() => {
    if (!connectionResult) {
      return "info";
    }

    if (connectionResult.ok) {
      return "success";
    }

    if (connectionResult.status) {
      return "warning";
    }

    return "error";
  }, [connectionResult]);

  const uploadTone = uploadStatus
    ? uploadStatus.tone === "success"
      ? "success"
      : uploadStatus.tone === "warning"
        ? "warning"
        : uploadStatus.tone === "error"
          ? "error"
          : "info"
    : null;

  return (
    <div className={styles.page}>
      {toast ? (
        <div className={cn(styles.toast, toastToneClass)} role="status" aria-live="polite">
          {toast.message}
        </div>
      ) : null}

      <header className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Data Ingestion Hub</h1>
          <span className={styles.helpIcon} aria-hidden="true" title="Need help with ingestion?">
            ?
          </span>
        </div>
        <p className={styles.subtitle}>
          Upload a CSV file or connect your live bank APIs to kick off the Arealis Magnus pipeline.
          Manage schema validation, data quality checks, and live sync from a single window.
        </p>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        aria-hidden="true"
        onChange={handleInputChange}
      />

      <div className={styles.columns}>
        <Card className={styles.uploadCardContent}>
          <CardHeader
            title="📤 CSV File Upload"
            subtitle="Upload a CSV file with your transaction data. We’ll validate the schema and prepare all 8 feature engines."
          />

          <section className={styles.description}>
            <p>Supported Format:</p>
            <ul className={styles.supportedList}>
              <li>
                <span className={styles.bullet} />
                <span>File Type: CSV (.csv)</span>
              </li>
              <li>
                <span className={styles.bullet} />
                <span>Max Size: 50 MB</span>
              </li>
              <li>
                <span className={styles.bullet} />
                <span>Encoding: UTF-8</span>
              </li>
            </ul>
          </section>

          <CardDivider />

          <section>
            <p className={styles.description}>Required Columns:</p>
            <ul className={styles.requiredList}>
              {REQUIRED_COLUMNS.map((column) => (
                <li key={column}>
                  <span className={styles.bullet} />
                  <span>{column}</span>
                </li>
              ))}
            </ul>
          </section>

          <CardDivider />

          <div
            className={styles.uploadArea}
            role="button"
            tabIndex={0}
            aria-label="Upload CSV file"
            onClick={handleDropzoneClick}
            onKeyDown={handleKeyboardActivate(handleDropzoneClick)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <span className={styles.uploadIcon}>📁</span>
            <div>
              <strong>Drag file here or</strong>
              <div className={styles.inlineLinks}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={handleBrowseFiles}
                  onKeyDown={handleKeyboardActivate(handleBrowseFiles)}
                >
                  Browse Files
                </button>
              </div>
            </div>
            <p className={styles.uploadHint}>
              We’ll animate the upload once you drop a file. Your data never leaves the secure session.
            </p>
          </div>

          {uploadStatus ? (
            <span role="status" aria-live="polite">
              <Tag tone={uploadTone ?? "info"} className={styles.uploadStatusTag}>
                {uploadStatus.message}
              </Tag>
            </span>
          ) : null}

          <div className={styles.inlineLinks}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={handleDownloadSample}
              onKeyDown={handleKeyboardActivate(handleDownloadSample)}
            >
              Download Sample CSV Template
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={handleViewFormatGuide}
              onKeyDown={handleKeyboardActivate(handleViewFormatGuide)}
            >
              View Format Guide
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="🔌 Live Bank API Setup"
            subtitle="Connect HDFC, ICICI, Axis, or Kotak APIs for real-time transaction monitoring. OAuth or API key workflows are supported."
          />
          <section>
            <p className={styles.description}>Setup Steps:</p>
            <ol className={styles.setupSteps}>
              {[
                "Enter bank API credentials",
                "Test connection",
                "Authorize & sync",
                "Jump to dashboard",
              ].map((step, idx) => (
                <li key={step}>
                  <span className={styles.bullet} />
                  <span>
                    Step {idx + 1}: {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className={styles.counterRow}>
            <Tag tone="info">Connected: 0/4 banks</Tag>
            <Tag tone="warning">Status: Not configured</Tag>
          </div>

          <CardDivider />

          <div className={styles.credentials}>
            {BANK_CONFIGS.map((bank) => (
              <div key={bank.id}>
                <Checkbox label={bank.label} name={`bank-${bank.id}`} />
                <TextInput
                  name={`${bank.id}-key`}
                  placeholder={bank.placeholder}
                  aria-label={bank.placeholder}
                />
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            className={styles.oauthButton}
            onClick={handleOAuthLogin}
            onKeyDown={handleKeyboardActivate(handleOAuthLogin)}
          >
            Login with Bank OAuth
          </Button>

          <div className={styles.ctaRow}>
            <Button
              variant="ghost"
              onClick={handleTestConnection}
              onKeyDown={handleKeyboardActivate(handleTestConnection)}
              disabled={isTestingConnection}
              aria-busy={isTestingConnection}
            >
              {isTestingConnection ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Testing…
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              variant="success"
              onClick={handleSetupLiveApi}
              onKeyDown={handleKeyboardActivate(handleSetupLiveApi)}
            >
              Setup Live API
            </Button>
          </div>

          <div className={styles.statusPanel} aria-live="polite">
            <h3>Connection Diagnostics</h3>
            <div className={styles.statusMeta}>
              <div className={styles.statusMetaRow}>
                <span>Endpoint</span>
                <code className={styles.statusMetaCode}>{DEMO_ENDPOINT}</code>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Last response</span>
                <Tag tone={connectionTone}>
                  {connectionResult ? connectionResult.status ?? "N/A" : "Not tested"}
                </Tag>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Timestamp</span>
                <span>{formattedTimestamp ?? "—"}</span>
              </div>
              <div className={styles.statusMetaRow}>
                <span>Authorization header</span>
                <code className={styles.statusMetaCode}>
                  {maskedAuthorization ?? "Trigger Test Connection to populate"}
                </code>
              </div>
            </div>
            {connectionResult?.message ? (
              <p className={styles.statusMessage}>{connectionResult.message}</p>
            ) : (
              <p className={styles.statusMessage}>
                Click “Test Connection” to call the live demo endpoint with the Arealis Magnus demo credential.
              </p>
            )}
          </div>
        </Card>
      </div>

      <section className={styles.dividerBlock}>
        <hr className="divider" />
        <div className={styles.ctaRow}>
          <Button
            variant="ghost"
            onClick={handleCancel}
            onKeyDown={handleKeyboardActivate(handleCancel)}
          >
            Cancel
          </Button>
          <Button onClick={handleUploadCsv} onKeyDown={handleKeyboardActivate(handleUploadCsv)}>
            Upload CSV
          </Button>
          <Button
            variant="success"
            onClick={handleSetupLiveApi}
            onKeyDown={handleKeyboardActivate(handleSetupLiveApi)}
          >
            Setup Live API
          </Button>
        </div>
      </section>

      <section className={styles.feedbackGrid} aria-label="Upload feedback">
        <Card dense>
          <CardHeader title="Processing Status" subtitle="Live status updated every second" />
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>
                <span className={styles.statusDot} />
                Schema validation
              </span>
              <Tag tone="success">Passed</Tag>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>
                <span className={styles.statusDot} />
                Column integrity
              </span>
              <Tag tone="info">In Progress</Tag>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>
                <span className={styles.statusDot} />
                Row count check
              </span>
              <Tag tone="warning">Queued</Tag>
            </div>
          </div>
          <div className={styles.progressBar} role="progressbar" aria-valuenow={58} aria-valuemin={0} aria-valuemax={100}>
            <span className={styles.progressFill} />
          </div>
        </Card>

        <Card dense>
          <CardHeader title="Issues & Guidance" subtitle="We surface actionable guidance to resolve blockers quickly." />
          <ul className={styles.issuesList}>
            <li>
              <Tag tone="error">Invalid file format</Tag>
              <p className={styles.description}>
                Ensure your file extension is .csv. XLSX and Google Sheets exports must be converted before upload.
              </p>
            </li>
            <li>
              <Tag tone="warning">File too large</Tag>
              <p className={styles.description}>
                Current limit is 50 MB. Consider chunking the file into multiple CSVs or switching to live API ingestion.
              </p>
            </li>
            <li>
              <Tag tone="info">Missing columns</Tag>
              <p className={styles.description}>
                Validate that all 13 required columns are present. We highlight missing headers in the validation report.
              </p>
            </li>
            <li>
              <Tag tone="error">Network retry</Tag>
              <p className={styles.description}>
                Lost connection detected. Retry upload or contact support if issue persists.
              </p>
            </li>
          </ul>
        </Card>

        <Card dense>
          <CardHeader title="Session Insights" subtitle="After completion you’ll be redirected with your session ID." />
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>
                <span className={styles.statusDot} />
                Session token
              </span>
              <Tag>sess_abc123xyz</Tag>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>
                <span className={styles.statusDot} />
                Redirect URL
              </span>
              <Tag tone="info">/dashboard?session=...</Tag>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>
                <span className={styles.statusDot} />
                Auto-refresh
              </span>
              <Tag tone="success">Enabled</Tag>
            </div>
          </div>
          <div className={styles.alert}>
            CSV processing typically completes in under 45 seconds. Live API sync runs every 5 minutes once authorised.
          </div>
        </Card>
      </section>
    </div>
  );
}


