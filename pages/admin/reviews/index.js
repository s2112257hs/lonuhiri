import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/Layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import GoogleReviewsConnection from "@/components/admin/GoogleReviewsConnection";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("order");
  const [source, setSource] = useState("");
  const [selection, setSelection] = useState("");
  const [search, setSearch] = useState("");
  const [reload, setReload] = useState(0);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const { toast } = useToast();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page, limit: 10, sortBy: sort, source, search });
        if (selection) params.set("featured", selection);
        const response = await fetch(`/api/reviews?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error("Unable to load reviews. Please try again.");
        setReviews(data.data);
        setPagination({ pages: data.pagination.pages, total: data.total });
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [page, sort, source, selection, search, reload]);
  async function updateReview(review, changes) {
    setSaving(review._id);
    try {
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Your change could not be saved.");
      setReload((value) => value + 1);
      toast({ title: "Review updated", description: "Your homepage selection has been saved." });
    } catch (err) {
      toast({ title: "Unable to save", description: err.message, variant: "destructive" });
    } finally { setSaving(null); }
  }
  const filter = (setter) => (event) => { setter(event.target.value); setPage(1); };
  async function deleteReview(review) {
    if (!window.confirm(`Delete the review from ${review.name}?`)) return;
    setSaving(review._id);
    try {
      const response = await fetch(`/api/reviews/${review._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error("The review could not be deleted.");
      if (reviews.length === 1 && page > 1) setPage(page - 1);
      else setReload((value) => value + 1);
      toast({ title: "Review deleted" });
    } catch (err) {
      toast({ title: "Unable to delete", description: err.message, variant: "destructive" });
    } finally { setSaving(null); }
  }
  const inputClass = "mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900";
  return (
    <AdminLayout>
      <div className="space-y-6 text-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Guest reviews</h1><p className="mt-1 text-sm text-gray-500">Choose which guest stories appear on your homepage.</p></div>
          <Button asChild><Link href="/admin/reviews/new">Add review</Link></Button>
        </div>
        <GoogleReviewsConnection onSynced={() => { setPage(1); setReload((value) => value + 1); }} />
        <div className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium">Search<input className={inputClass} value={search} onChange={filter(setSearch)} placeholder="Guest name or review text" /></label>
          <label className="text-sm font-medium">Sort by<select className={inputClass} value={sort} onChange={filter(setSort)}><option value="order">Homepage order</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="rating-high">Highest rating</option><option value="rating-low">Lowest rating</option></select></label>
          <label className="text-sm font-medium">Source<select className={inputClass} value={source} onChange={filter(setSource)}><option value="">All reviews</option><option value="google">Google</option><option value="manual">Manually added</option></select></label>
          <label className="text-sm font-medium">Homepage selection<select className={inputClass} value={selection} onChange={filter(setSelection)}><option value="">All selections</option><option value="true">Selected</option><option value="false">Not selected</option></select></label>
        </div>
        <p className="text-sm text-gray-500">{pagination.total} matching reviews. Lower display-order numbers appear first. The homepage displays up to six selected, active reviews.</p>
        {loading ? <p role="status" className="py-12 text-center">Loading reviews…</p> : error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5">{error}<Button variant="outline" className="ml-4" onClick={() => setReload(reload + 1)}>Retry</Button></div> : reviews.length === 0 ? <div className="rounded-xl border bg-white p-12 text-center"><h2 className="font-semibold">No reviews found</h2><p className="mt-2 text-sm text-gray-500">Try changing your filters or add a review.</p></div> : (
          <div className="space-y-4">{reviews.map((review) => (
            <article key={review._id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{review.name}</h2><p className="mt-1 text-sm text-gray-500">{review.rating}/5 · {review.source === "google" ? "Google" : "Manually added"} · {review.date || "No date"}</p></div><Link className="text-sm font-medium text-primary underline" href={`/admin/reviews/${review._id}`}>Edit review</Link></div>
              <p className="my-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{review.review}</p>
              <div className="flex flex-wrap items-center gap-6 border-t pt-4">
                <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={!!review.featured} disabled={saving !== null} onChange={(e) => updateReview(review, { featured: e.target.checked })} />Show on homepage</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={!!review.isActive} disabled={saving !== null} onChange={(e) => updateReview(review, { isActive: e.target.checked })} />Active</label>
                <label className="flex items-center gap-2 text-sm">Display order<input key={`${review._id}-${review.order}`} aria-label={`Display order for ${review.name}`} type="number" min="0" max="9999" step="1" defaultValue={review.order || 0} disabled={saving !== null} className="w-20 rounded-md border px-2 py-1" onBlur={(e) => { const order = Number(e.target.value); if (e.target.value !== "" && Number.isInteger(order) && order >= 0 && order <= 9999 && order !== review.order) updateReview(review, { order }); }} /></label>
                {review.featured && !review.isActive && <span className="text-xs text-amber-700">Activate this review to display it.</span>}
                {saving === review._id && <span role="status" className="text-sm text-gray-500">Saving…</span>}
                <button type="button" disabled={saving !== null} onClick={() => deleteReview(review)} className="text-sm text-red-700 underline disabled:opacity-50">Delete review</button>
              </div>
            </article>
          ))}</div>
        )}
        <div className="flex items-center justify-between"><p className="text-sm text-gray-500">Page {page} of {pagination.pages}</p><div className="flex gap-2"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" disabled={loading || page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>
      </div>
    </AdminLayout>
  );
}
