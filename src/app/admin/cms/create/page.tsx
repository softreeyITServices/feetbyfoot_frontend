"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type FAQ = {
  title: string;
  description: string;
};

function CmsCreateEditPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const nameParam = searchParams.get("name");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cmsId, setCmsId] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    title: "",
    content: "",
    faq: [] as FAQ[],
  });

  const isEdit = !!nameParam;

  const toPageName = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_");

  /* ================= FETCH (EDIT MODE) ================= */

  const fetchCms = useCallback(async () => {
    if (!nameParam) return;
    try {
      setLoading(true);
      const res = await CmsService.getByName(nameParam);
      setCmsId(res._id);
      setForm({
        name: res.name,
        title: res.title,
        content: res.content || "",
        faq: res.faq || [],
      });
    } catch {
      toast.error("Failed to load CMS");
    } finally {
      setLoading(false);
    }
  }, [nameParam]);

  useEffect(() => {
    fetchCms();
  }, [fetchCms]);

  /* ================= FAQ HANDLERS ================= */

  const addFaq = () => {
    setForm((p) => ({
      ...p,
      faq: [...p.faq, { title: "", description: "" }],
    }));
  };

  const updateFaq = (index: number, key: keyof FAQ, value: string) => {
    const updated = [...form.faq];
    updated[index][key] = value;
    setForm({ ...form, faq: updated });
  };

  const removeFaq = (index: number) => {
    const updated = form.faq.filter((_, i) => i !== index);
    setForm({ ...form, faq: updated });
  };

  /* ================= SAVE ================= */

  const handleSubmit = async () => {
    if (!form.name || !form.title) {
      toast.error("Name & Title required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        title: form.title,
        content: form.content,
        faq: form.faq,
      };

      if (isEdit && cmsId) {
        await CmsService.update(cmsId, payload);
      } else {
        await CmsService.create(payload);
      }
      toast.success("Saved successfully");
      router.push("/admin/cms");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingDot} />
        <span style={styles.loadingText}>Loading page…</span>

        <style>{keyframes}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      {/* ── Header ── */}
      <header style={styles.header}>
        <button onClick={() => router.push("/admin/cms")} style={styles.backBtn}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div>
          <p style={styles.breadcrumb}>CMS / {isEdit ? "Edit" : "New"}</p>
          <h1 style={styles.pageTitle}>
            {isEdit ? "Edit Page" : "Create Page"}
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
        >
          {saving ? (
            <>
              <span style={styles.spinner} />
              Saving…
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 3 7 8 15 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save Page
            </>
          )}
        </button>
      </header>

      {/* ── Body ── */}
      <div style={styles.body}>

        {/* ── Left column ── */}
        <div style={styles.mainCol}>

          {/* Basic info card */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 style={styles.cardTitle}>Page Details</h2>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Page Name
                <span style={styles.badge}>Auto-generated</span>
              </label>
              <input
                value={form.name}
                disabled
                onChange={() => undefined}
                style={{ ...styles.input, ...styles.inputDisabled }}
                placeholder="e.g. privacy_policy"
              />
              <p style={styles.hint}>
                Generated from title and locked. Used as a unique identifier.
              </p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Page Title</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: nextTitle,
                    name: isEdit ? prev.name : toPageName(nextTitle),
                  }));
                }}
                style={styles.input}
                placeholder="e.g. Privacy Policy"
              />
            </div>
          </section>

          {/* Content card */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 style={styles.cardTitle}>Content</h2>
            </div>

            <div style={styles.editorWrapper}>
              <Editor
                apiKey="bep73yuqiicvrn8vne9fslnk6czp869xx97eh8ditokk4y8i"
                value={form.content}
                onEditorChange={(value) => setForm({ ...form, content: value })}
                init={{
                  height: 420,
                  menubar: false,
                  skin: "oxide",
                  plugins: ["lists", "link", "image", "code", "table"],
                  toolbar:
                    "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
                  content_style:
                    "body { font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a1a2e; line-height: 1.7; }",
                }}
              />
            </div>
          </section>

          {/* FAQ card */}
          {/* <section style={styles.card}>
            <div style={{ ...styles.cardHeader, marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={styles.cardIcon}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2 style={styles.cardTitle}>FAQs</h2>
                {form.faq.length > 0 && (
                  <span style={styles.faqCount}>{form.faq.length}</span>
                )}
              </div>

              <button onClick={addFaq} style={styles.addFaqBtn}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                  <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                </svg>
                Add FAQ
              </button>
            </div>

            {form.faq.length === 0 ? (
              <div style={styles.emptyFaq}>
                <svg width="28" height="28" fill="none" stroke="#c8c8d8" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                </svg>
                <p style={styles.emptyFaqText}>No FAQs yet. Click Add FAQ to get started.</p>
              </div>
            ) : (
              <div style={styles.faqList}>
                {form.faq.map((faq, index) => (
                  <div key={index} style={styles.faqItem}>
                    <div style={styles.faqIndex}>{index + 1}</div>

                    <div style={styles.faqFields}>
                      <input
                        value={faq.title}
                        onChange={(e) => updateFaq(index, "title", e.target.value)}
                        placeholder="Question"
                        style={styles.faqInput}
                      />
                      <textarea
                        value={faq.description}
                        onChange={(e) => updateFaq(index, "description", e.target.value)}
                        placeholder="Answer"
                        rows={3}
                        style={styles.faqTextarea}
                      />
                    </div>

                    <button onClick={() => removeFaq(index)} style={styles.removeFaqBtn} title="Remove FAQ">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section> */}
        </div>

        {/* ── Right sidebar ── */}
        <aside style={styles.sidebar}>
          <div style={styles.sideCard}>
            <p style={styles.sideTitle}>Publish</p>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ ...styles.saveBtn, width: "100%", justifyContent: "center", ...(saving ? styles.saveBtnDisabled : {}) }}
            >
              {saving ? (
                <>
                  <span style={styles.spinner} />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 3 7 8 15 8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Save Page
                </>
              )}
            </button>
            <button
              onClick={() => router.push("/admin/cms")}
              style={styles.cancelBtn}
            >
              Discard Changes
            </button>
          </div>

          <div style={styles.sideCard}>
            <p style={styles.sideTitle}>Summary</p>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Status</span>
              <span style={styles.statusPill}>{isEdit ? "Editing" : "New"}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>FAQs</span>
              <span style={styles.summaryValue}>{form.faq.length}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Content</span>
              <span style={styles.summaryValue}>
                {form.content.replace(/<[^>]*>/g, "").length} chars
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CmsCreateEditPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.loadingWrapper}>
          <div style={styles.loadingDot} />
          <span style={styles.loadingText}>Loading page…</span>
          <style>{keyframes}</style>
        </div>
      }
    >
      <CmsCreateEditPageContent />
    </Suspense>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const C = {
  bg: "#f4f4f7",
  surface: "#ffffff",
  border: "#e8e8ef",
  text: "#1a1a2e",
  muted: "#8888a0",
  accent: "var(--color-amber-400)",
  accentLight: "#fef3c7",
  danger: "#ef4444",
  dangerLight: "#fef2f2",
  success: "#10b981",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: C.text,
  },

  /* ── Header ── */
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    padding: "1rem 2rem",
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    position: "sticky" as const,
    top: "56px",
    zIndex: 40,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: C.muted,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.4rem 0.6rem",
    borderRadius: "8px",
    transition: "background 0.15s",
    marginRight: "0.25rem",
  },
  breadcrumb: {
    fontSize: "0.72rem",
    color: C.muted,
    margin: 0,
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
  },
  pageTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  saveBtn: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    background: C.accent,
    color: "#1a1a2e",
    border: "none",
    borderRadius: "10px",
    padding: "0.55rem 1.15rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.1s",
    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
    letterSpacing: "-0.01em",
  },
  saveBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  /* ── Body layout ── */
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 260px",
    gap: "1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "1.75rem 2rem 3rem",
  },
  mainCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },

  /* ── Cards ── */
  card: {
    background: C.surface,
    borderRadius: "14px",
    border: `1px solid ${C.border}`,
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    marginBottom: "1.25rem",
    justifyContent: "space-between",
  },
  cardIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    borderRadius: "7px",
    background: C.accentLight,
    color: C.accent,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.01em",
    flex: 1,
  },

  /* ── Fields ── */
  fieldGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: C.text,
    marginBottom: "0.4rem",
    letterSpacing: "0.01em",
    textTransform: "uppercase" as const,
  },
  badge: {
    fontSize: "0.65rem",
    fontWeight: 500,
    background: "#f0f0f5",
    color: C.muted,
    padding: "0.15rem 0.45rem",
    borderRadius: "20px",
    letterSpacing: "0.02em",
    textTransform: "none" as const,
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.85rem",
    border: `1.5px solid ${C.border}`,
    borderRadius: "9px",
    fontSize: "0.9rem",
    color: C.text,
    background: "#fafafa",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  inputDisabled: {
    background: "#f4f4f7",
    color: C.muted,
    cursor: "not-allowed",
  },
  hint: {
    fontSize: "0.74rem",
    color: C.muted,
    marginTop: "0.35rem",
    margin: "0.3rem 0 0",
  },
  editorWrapper: {
    borderRadius: "9px",
    overflow: "hidden",
    border: `1.5px solid ${C.border}`,
  },

  /* ── FAQ ── */
  faqCount: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: C.accentLight,
    color: C.accent,
    fontSize: "0.72rem",
    fontWeight: 700,
  },
  addFaqBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: C.accent,
    background: C.accentLight,
    border: "none",
    borderRadius: "8px",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
    transition: "background 0.15s",
    letterSpacing: "-0.01em",
  },
  emptyFaq: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    padding: "2rem",
    borderRadius: "10px",
    border: `1.5px dashed ${C.border}`,
    background: "#fafafa",
  },
  emptyFaqText: {
    fontSize: "0.82rem",
    color: C.muted,
    margin: 0,
    textAlign: "center" as const,
  },
  faqList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.85rem",
  },
  faqItem: {
    display: "flex",
    gap: "0.85rem",
    alignItems: "flex-start",
    background: "#fafafa",
    border: `1.5px solid ${C.border}`,
    borderRadius: "10px",
    padding: "1rem",
    animation: "fadeSlideIn 0.2s ease",
  },
  faqIndex: {
    flexShrink: 0,
    width: "24px",
    height: "24px",
    borderRadius: "7px",
    background: C.accentLight,
    color: C.accent,
    fontSize: "0.72rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "0.3rem",
  },
  faqFields: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.6rem",
  },
  faqInput: {
    width: "100%",
    padding: "0.55rem 0.8rem",
    border: `1.5px solid ${C.border}`,
    borderRadius: "8px",
    fontSize: "0.87rem",
    color: C.text,
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    fontWeight: 500,
    boxSizing: "border-box" as const,
  },
  faqTextarea: {
    width: "100%",
    padding: "0.55rem 0.8rem",
    border: `1.5px solid ${C.border}`,
    borderRadius: "8px",
    fontSize: "0.87rem",
    color: C.text,
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical" as const,
    lineHeight: 1.6,
    boxSizing: "border-box" as const,
  },
  removeFaqBtn: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: C.dangerLight,
    color: C.danger,
    border: "none",
    cursor: "pointer",
    marginTop: "0.15rem",
    transition: "background 0.15s",
  },

  /* ── Sidebar ── */
  sidebar: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    paddingTop: "0",
  },
  sideCard: {
    background: C.surface,
    borderRadius: "14px",
    border: `1px solid ${C.border}`,
    padding: "1.2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  sideTitle: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    margin: "0 0 0.85rem",
  },
  cancelBtn: {
    display: "block",
    width: "100%",
    marginTop: "0.6rem",
    padding: "0.5rem",
    background: "none",
    border: `1.5px solid ${C.border}`,
    borderRadius: "10px",
    fontSize: "0.82rem",
    fontWeight: 500,
    color: C.muted,
    cursor: "pointer",
    textAlign: "center" as const,
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0",
    borderBottom: `1px solid ${C.border}`,
  },
  summaryLabel: {
    fontSize: "0.8rem",
    color: C.muted,
  },
  summaryValue: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: C.text,
  },
  statusPill: {
    fontSize: "0.72rem",
    fontWeight: 600,
    background: C.accentLight,
    color: C.accent,
    padding: "0.2rem 0.55rem",
    borderRadius: "20px",
  },

  /* ── Loading ── */
  loadingWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "1rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingDot: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `3px solid ${C.accentLight}`,
    borderTopColor: C.accent,
    animation: "spin 0.7s linear infinite",
  },
  loadingText: {
    fontSize: "0.85rem",
    color: C.muted,
  },

  /* ── Spinner (inside button) ── */
  spinner: {
    display: "inline-block",
    width: "13px",
    height: "13px",
    borderRadius: "50%",
    border: "2px solid rgba(26,26,46,0.25)",
    borderTopColor: "#1a1a2e",
    animation: "spin 0.7s linear infinite",
  },
};

const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  input:focus, textarea:focus {
    border-color: var(--color-amber-400) !important;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
    background: #fff !important;
  }
`;