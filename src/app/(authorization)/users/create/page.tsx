import { UserForm } from "@/features/users/components/user-form";

export default function CreateUserPage() {
  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Add New Team Member
        </h1>
      </div>
      <UserForm mode="create" />
    </div>
  );
}
