import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get("name") || "Digital Business Card";
    const designation = searchParams.get("designation") || "Professional";
    const company = searchParams.get("company") || "";
    const photo = searchParams.get("photo");
    const bg = searchParams.get("bg");
    const fit = searchParams.get("fit") === "cover" ? "cover" : "contain";
    const format = searchParams.get("format") || "banner";

    // 1. Dedicated Square 600x600 layout (used for WhatsApp left-side thumbnail)
    if (format === "square") {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#07080a",
              padding: "36px",
              fontFamily: "sans-serif",
              overflow: "hidden",
            }}
          >
            {/* Theme Background Image filling the entire square */}
            {bg && bg.startsWith("http") ? (
              <img
                src={bg}
                alt="theme-bg"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage:
                    "radial-gradient(circle at 50% 30%, #1e293b 0%, #07080a 100%)",
                }}
              />
            )}

            {/* Dark glass overlay for contrast and legibility */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(10, 12, 16, 0.62)",
              }}
            />

            {/* Profile Avatar Card with Glowing Ring */}
            <div
              style={{
                position: "relative",
                width: "220px",
                height: "220px",
                borderRadius: "48px",
                backgroundColor: "#18181b",
                border: "4px solid rgba(56, 189, 248, 0.7)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {photo && photo.startsWith("http") ? (
                <img
                  src={photo}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ fontSize: "96px", color: "#71717a", display: "flex" }}>
                  👤
                </div>
              )}
            </div>

            {/* Name & Verified Badge */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "24px",
                maxWidth: "520px",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                }}
              >
                {name}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "26px",
                  height: "26px",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                ✓
              </span>
            </div>

            {/* Designation & Company */}
            <span
              style={{
                position: "relative",
                fontSize: "22px",
                fontWeight: 600,
                color: "#38bdf8",
                marginTop: "6px",
                textAlign: "center",
              }}
            >
              {designation}
            </span>

            {company && (
              <span
                style={{
                  position: "relative",
                  fontSize: "19px",
                  color: "#e4e4e7",
                  marginTop: "4px",
                  textAlign: "center",
                }}
              >
                {company}
              </span>
            )}
          </div>
        ),
        {
          width: 600,
          height: 600,
        }
      );
    }

    // 2. Wide Banner 1200x630 layout (Split: Left photo only | Right theme in background with info)
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#07080a",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #181b22 2%, transparent 0%), radial-gradient(circle at 75px 75px, #181b22 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Split Card Container */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "1060px",
              height: "480px",
              display: "flex",
              flexDirection: "row",
              backgroundColor: "#0d0f14",
              borderRadius: "32px",
              border: "2px solid #27272a",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
              overflow: "hidden",
            }}
          >
            {/* LEFT: Uploaded Photo ONLY */}
            <div
              style={{
                width: "400px",
                height: "100%",
                backgroundColor: "#111318",
                borderRight: "2px solid #27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {photo && photo.startsWith("http") ? (
                <img
                  src={photo}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ fontSize: "120px", color: "#52525b", display: "flex" }}>
                  👤
                </div>
              )}
            </div>

            {/* RIGHT: Theme in Background with Information on it */}
            <div
              style={{
                flex: 1,
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "48px 48px",
                overflow: "hidden",
                backgroundColor: "#0d0f14",
              }}
            >
              {/* Theme Wallpaper on the right side */}
              {bg && bg.startsWith("http") ? (
                <img
                  src={bg}
                  alt="theme-bg"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: fit === "cover" ? "cover" : "contain",
                    padding: fit === "cover" ? "0px" : "16px",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundImage:
                      "linear-gradient(135deg, #091e17 0%, #0d0f14 100%)",
                  }}
                />
              )}

              {/* Dark overlay for crystal clear contrast */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(10, 12, 16, 0.72)",
                }}
              />

              {/* Information Content on top of Theme */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 10,
                }}
              >
                {/* Name + Verified Checkmark Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span
                    style={{
                      fontSize: "44px",
                      fontWeight: "bold",
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </span>
                </div>

                {/* Designation */}
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "#38bdf8",
                    marginTop: "10px",
                  }}
                >
                  {designation}
                </span>

                {/* Company Name */}
                {company && (
                  <span
                    style={{
                      fontSize: "22px",
                      color: "#e4e4e7",
                      marginTop: "6px",
                    }}
                  >
                    {company}
                  </span>
                )}

                {/* Divider Line */}
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    margin: "28px 0 20px 0",
                  }}
                />

                {/* Action Badges Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "rgba(24, 24, 27, 0.8)",
                        padding: "8px 16px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#e4e4e7",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                    >
                      📞 Call
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "rgba(24, 24, 27, 0.8)",
                        padding: "8px 16px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#e4e4e7",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                    >
                      💬 WhatsApp
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: "rgba(24, 24, 27, 0.8)",
                        padding: "8px 16px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#e4e4e7",
                        fontSize: "15px",
                        fontWeight: 500,
                      }}
                    >
                      📍 Location
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "14px",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    InaCard &bull; Digital Card
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error("OG image generation failed:", err);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}

