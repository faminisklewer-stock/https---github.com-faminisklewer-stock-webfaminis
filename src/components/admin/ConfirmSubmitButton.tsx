"use client";

export function ConfirmSubmitButton({
  children,
  message,
}: {
  children: React.ReactNode;
  message: string;
}) {
  return (
    <button
      className="button button-danger"
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
