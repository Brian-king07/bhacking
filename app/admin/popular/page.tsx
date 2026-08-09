import { redirect } from "next/navigation";

/** Popular ya no forma parte del storefront. */
export default function AdminPopularRemovedPage() {
  redirect("/admin");
}
