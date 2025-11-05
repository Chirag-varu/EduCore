import { useEffect, useRef } from "react";

/**
 * A small helper to set document.title with a consistent suffix.
 * Usage: useDocumentTitle(`Course: ${courseTitle}`) // will append " — EduCore"
 */
export default function useDocumentTitle(title, opts = {}) {
  const { suffix = " — EduCore", restoreOnUnmount = false } = opts;
  const previous = useRef(typeof document !== "undefined" ? document.title : "");

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!title) return; // no-op until we have a title
    document.title = `${title}${suffix || ""}`;

    return () => {
      if (restoreOnUnmount) {
        document.title = previous.current;
      }
    };
  }, [title, suffix, restoreOnUnmount]);
}
