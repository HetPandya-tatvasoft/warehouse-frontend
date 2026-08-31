import { redirect } from "next/navigation";

export default function SettingsLandingPage() {
  redirect("/settings/product-settings/categories");
}
