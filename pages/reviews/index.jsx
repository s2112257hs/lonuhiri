import { ReviewCard } from "@/components/review-card";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewsPage({
  reviews = [],
  pagination = { current: 1, pages: 1, total: 0 },
}) {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Guest Reviews
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Read what our guests have to say about their experiences with us
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  name={review.name}
                  avatar={review.avatar}
                  rating={review.rating}
                  review={review.review}
                  date={review.date}
                  source={review.source}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={
                    pagination.current > 1
                      ? `/reviews?page=${pagination.current - 1}`
                      : "#"
                  }
                >
                  <Button
                    variant="outline"
                    disabled={pagination.current === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </Link>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === pagination.pages ||
                        (page >= pagination.current - 1 &&
                          page <= pagination.current + 1)
                      ) {
                        return (
                          <Link key={page} href={`/reviews?page=${page}`}>
                            <Button
                              variant={
                                page === pagination.current
                                  ? "default"
                                  : "outline"
                              }
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          </Link>
                        );
                      } else if (
                        page === pagination.current - 2 ||
                        page === pagination.current + 2
                      ) {
                        return (
                          <span key={page} className="px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                </div>

                <Link
                  href={
                    pagination.current < pagination.pages
                      ? `/reviews?page=${pagination.current + 1}`
                      : "#"
                  }
                >
                  <Button
                    variant="outline"
                    disabled={pagination.current === pagination.pages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="text-center mt-6 text-sm text-muted-foreground">
              Showing {reviews.length} of {pagination.total} reviews
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No reviews found</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const { req, query } = context;
  const page = parseInt(query.page) || 1;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || `${protocol}://${host}`;

  try {
    const response = await axios.get(
      `${baseURL}/api/reviews?page=${page}&limit=12&isActive=true&sortBy=order`
    );

    if (response.data.success) {
      return {
        props: {
          reviews: response.data.data || [],
          pagination: response.data.pagination || {
            current: 1,
            pages: 1,
            total: 0,
          },
        },
      };
    } else {
      return {
        props: {
          reviews: [],
          pagination: { current: 1, pages: 1, total: 0 },
        },
      };
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      props: {
        reviews: [],
        pagination: { current: 1, pages: 1, total: 0 },
      },
    };
  }
}

