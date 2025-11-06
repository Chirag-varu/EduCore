import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RouteGuard from "./index.jsx";

function Page({ label }) {
  return <div>{label}</div>;
}

function renderWithRouter({ initialPath, authenticated, user, allowedRoles, elementLabel = "Protected" }) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/*"
          element={
            <RouteGuard
              authenticated={authenticated}
              user={user}
              allowedRoles={allowedRoles}
              element={<Page label={elementLabel} />}
            />
          }
        />
        <Route path="/auth" element={<Page label="AUTH" />} />
        <Route path="/home" element={<Page label="HOME" />} />
        <Route path="/instructor" element={<Page label="INSTRUCTOR" />} />
        <Route path="/admin/newsletters" element={<Page label="ADMIN_NEWS" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RouteGuard", () => {
  it("allows unauthenticated access to /auth", () => {
    renderWithRouter({ initialPath: "/auth", authenticated: false, user: null });
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to /auth when accessing protected route", () => {
    renderWithRouter({ initialPath: "/instructor", authenticated: false, user: null });
    expect(screen.getByText("AUTH")).toBeInTheDocument();
  });

  it("redirects authenticated student away from /auth to /home", () => {
    renderWithRouter({ initialPath: "/auth", authenticated: true, user: { role: "student" } });
    expect(screen.getByText("HOME")).toBeInTheDocument();
  });

  it("allows instructor to access /instructor", () => {
    renderWithRouter({ initialPath: "/instructor", authenticated: true, user: { role: "instructor" } });
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });

  it("blocks student from accessing /admin and redirects to /home", () => {
    renderWithRouter({ initialPath: "/admin", authenticated: true, user: { role: "student" } });
    expect(screen.getByText("HOME")).toBeInTheDocument();
  });

  it("allows admin to access /admin/newsletters", () => {
    renderWithRouter({ initialPath: "/admin/newsletters", authenticated: true, user: { role: "admin" } });
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});
