import { useEffect, useRef } from "react";

export const useChildrenBlurEvent = <T extends HTMLElement>(
  onBlur: () => unknown
) => {
  const ref = useRef<T>(null);

  const closeWithEsc = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onBlur();
    }
  };
  const closeWithClick = (event: MouseEvent) => {
    if (!ref.current?.contains(event.target as any)) {
      onBlur();
    }
  };
  const focusOutWithRelatedTarget = (event: FocusEvent) => {
    if (
      event.relatedTarget &&
      !ref.current?.contains(event.relatedTarget as any)
    ) {
      onBlur();
    }
  };

  useEffect(() => {
    if (ref.current) {
      document.addEventListener("click", closeWithClick);
      document.addEventListener("keydown", closeWithEsc);
      ref.current.addEventListener("focusout", focusOutWithRelatedTarget);
    }

    return () => {
      document.removeEventListener("click", closeWithClick);
      document.removeEventListener("keydown", closeWithEsc);
      if (ref.current) {
        ref.current.removeEventListener("focusout", focusOutWithRelatedTarget);
      }
    };
  }, [ref.current]);

  return { ref };
};
