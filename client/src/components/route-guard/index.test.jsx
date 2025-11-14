import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RouteGuard from "./index.jsx";

function Page({ label }) {
  return <div>{label}</div>;
}

// Test harness updated to mount RouteGuard on the specific protected routes instead of a greedy catch-all.
function renderScenario({ initialPath, authenticated, user }) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {/* Auth route guarded to allow redirect when already authenticated */}
        <Route
          path="/auth"
          element={
            <RouteGuard
              authenticated={authenticated}
              user={user}
              element={<Page label="AUTH" />}
            />
          }
        />
        {/* Home destination */}
        <Route path="/home" element={<Page label="HOME" />} />
        {/* Protected instructor route */}
        <Route
          path="/instructor"
          element={
            <RouteGuard
              authenticated={authenticated}
              user={user}
              element={<Page label="INSTRUCTOR_PAGE" />}
            />
          }
        />
        {/* Protected admin newsletters route */}
        <Route
          path="/admin/newsletters"
          element={
            <RouteGuard
              authenticated={authenticated}
              user={user}
              allowedRoles={["admin"]}
              element={<Page label="ADMIN_NEWS_PAGE" />}
            />
          }
        />
        {/* Fallback for other paths (treated as protected generic) */}
        <Route
          path="*"
          element={
            <RouteGuard
              authenticated={authenticated}
              user={user}
              element={<Page label="GENERIC_PROTECTED" />}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("RouteGuard", () => {
  it("renders AUTH page for unauthenticated /auth access", () => {
    renderScenario({ initialPath: "/auth", authenticated: false, user: null });
    expect(screen.getByText("AUTH")).toBeInTheDocument();
  });

  it("redirects unauthenticated user from /instructor to /auth", () => {
    renderScenario({ initialPath: "/instructor", authenticated: false, user: null });
    expect(screen.getByText("AUTH")).toBeInTheDocument();
  });

  it("redirects authenticated student from /auth to /home", async () => {
    renderScenario({ initialPath: "/auth", authenticated: true, user: { role: "student" } });
    expect(await screen.findByText("HOME")).toBeInTheDocument();
  });

  it("allows instructor access to /instructor", () => {
    renderScenario({ initialPath: "/instructor", authenticated: true, user: { role: "instructor" } });
    expect(screen.getByText("INSTRUCTOR_PAGE")).toBeInTheDocument();
  });

  it("redirects student from /admin/newsletters to /home", () => {
    renderScenario({ initialPath: "/admin/newsletters", authenticated: true, user: { role: "student" } });
    expect(screen.getByText("HOME")).toBeInTheDocument();
  });

  it("allows admin access to /admin/newsletters", () => {
    renderScenario({ initialPath: "/admin/newsletters", authenticated: true, user: { role: "admin" } });
    expect(screen.getByText("ADMIN_NEWS_PAGE")).toBeInTheDocument();
  });
});
