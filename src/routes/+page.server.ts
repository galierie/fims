import { redirect } from "@sveltejs/kit";

export function load() {
  // TODO: Change conditional
  if (true) {
    return redirect(307, '/login');
  }
}