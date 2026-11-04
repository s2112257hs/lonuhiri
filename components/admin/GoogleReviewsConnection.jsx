import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function GoogleReviewsConnection({ onSynced }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    fetch("/api/reviews/google", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Could not check Google configuration.");
        setConfig(data.data);
      })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [reload]);

  async function sync() {
    setSyncing(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/reviews/google", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Google reviews could not be synced.");
      setResult(data.data);
      setReload((value) => value + 1);
      onSynced();
    } catch (err) { setError(err.message); }
    finally { setSyncing(false); }
  }
  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Google reviews</h2>
          <p className="mt-1 text-sm text-gray-600">
            {!config ? "Checking configuration…" : config.configured ? "Automatic sync is enabled. Reviews refresh on the first website or admin visit after 24 hours." : "Add your Google Business Profile settings to enable automatic review import."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={syncing} onClick={() => setReload((value) => value + 1)}>Check settings</Button>
          <Button disabled={!config?.configured || syncing} onClick={sync}>{syncing ? "Syncing all reviews…" : "Sync Google reviews"}</Button>
        </div>
      </div>
      {!!config?.missing.length && <p className="mt-3 break-words text-xs text-gray-600">Missing settings: {config.missing.join(", ")}</p>}
      {!!config?.invalid.length && <p className="mt-3 break-words text-xs text-red-700">Invalid settings: {config.invalid.join(", ")}. Enter the ID only, without accounts/ or locations/ prefixes or whitespace. Letters and symbols are allowed.</p>}
      <p className="mt-3 text-xs text-gray-600">New imports are not selected for the homepage. Choose the reviews you want to display; future syncs keep your selections and display order. Reviews removed from Google are hidden after a complete sync.</p>
      {config?.lastSuccessfulAt && <p className="mt-2 text-xs text-gray-600">Last successful sync: {new Date(config.lastSuccessfulAt).toLocaleString()}</p>}
      {config?.lastError && <p role="alert" className="mt-2 whitespace-pre-wrap break-words text-sm text-amber-800">Last automatic sync failed: {config.lastError} Cached reviews remain available while we retry.</p>}
      <details className="mt-4 text-sm text-gray-700">
        <summary className="cursor-pointer font-medium">Connection setup</summary>
        <p className="mt-2">Use an approved Google Cloud project and an OAuth refresh token for the Google account that manages this verified Business Profile. Add the server settings to .env.local, then restart the website. Setup instructions are in the project README.</p>
        <p className="mt-2">No review links are needed. Automatic sync fetches every page and refreshes your Google access token. You can also sync immediately using the button above.</p>
      </details>
      {error && <p role="alert" className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {result && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">Sync complete: {result.fetched} reviews fetched, {result.imported} added, {result.updated} refreshed. Last synced {new Date(result.syncedAt).toLocaleString()}.</p>}
    </section>
  );
}
