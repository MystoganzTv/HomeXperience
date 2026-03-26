import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 42%), linear-gradient(180deg, #132236 0%, #08111d 100%)",
          borderRadius: 18,
          border: "1px solid rgba(88,196,182,0.32)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 46,
            height: 46,
            borderRadius: 16,
            background:
              "linear-gradient(180deg, rgba(88,196,182,0.24) 0%, rgba(8,17,29,0.18) 100%)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 64 64"
            fill="none"
          >
            <path
              d="M16 30.5L32 17L48 30.5"
              stroke="rgba(216,251,245,0.96)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 29.5V45C21 47.2 22.8 49 25 49H39C41.2 49 43 47.2 43 45V29.5"
              stroke="rgba(88,196,182,0.98)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M29 49V38C29 36.9 29.9 36 31 36H33C34.1 36 35 36.9 35 38V49"
              stroke="rgba(216,251,245,0.9)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M46.5 18L47.6 21.1L50.8 22.2L47.6 23.3L46.5 26.5L45.4 23.3L42.2 22.2L45.4 21.1L46.5 18Z"
              fill="rgba(216,251,245,0.96)"
            />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
