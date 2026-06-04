import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Flame, LoaderCircle, Plus, RotateCw, Trophy } from "lucide-react";

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function extractChallengeItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.challenges)) return data.challenges;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.progress)) return data.progress;
  if (data?.challenge && typeof data.challenge === "object") return [data.challenge];
  if (data?.data && typeof data.data === "object") return [data.data];
  return [];
}

function normalizeChallenge(item) {
  const target = Number(item?.target ?? item?.target_progress ?? 0);
  const progress = Number(item?.progress ?? item?.current ?? item?.current_progress ?? 0);
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 1;
  const safeProgress = Number.isFinite(progress) ? Math.max(0, progress) : 0;

  return {
    id: item?.id ?? item?.challenge_id ?? item?.title,
    title: item?.title || "Tantangan Eco Mingguan",
    target: safeTarget,
    progress: Math.min(safeProgress, safeTarget),
    isCompleted: Boolean(item?.isCompleted ?? item?.is_completed ?? safeProgress >= safeTarget),
  };
}

function getStreakValue(data) {
  const value =
    data?.daily_streak ??
    data?.days ??
    data?.count ??
    data?.streak?.current_streak ??
    data?.streak ??
    data?.data?.streak ??
    0;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getUpdatedChallenge(data) {
  const source = data?.challenge || data?.item || data?.data || data?.progress;
  if (!source || Array.isArray(source) || typeof source !== "object") return null;
  return normalizeChallenge(source);
}

export default function WeeklyChallengeStreak({ apiBaseUrl = DEFAULT_API_BASE_URL, userId = "demo-user" }) {
  const [streak, setStreak] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingChallengeId, setUpdatingChallengeId] = useState(null);

  const endpoints = useMemo(
    () => ({
      streak: `${apiBaseUrl}/api/v1/users/${userId}/streak`,
      challenges: `${apiBaseUrl}/api/v1/challenges/weekly?user_id=${encodeURIComponent(userId)}`,
      progress: `${apiBaseUrl}/api/v1/challenges/weekly/progress`,
    }),
    [apiBaseUrl, userId]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeeklyChallengeData() {
      setIsLoading(true);
      setError(null);

      try {
        const [streakResponse, challengesResponse] = await Promise.all([
          fetch(endpoints.streak, { signal: controller.signal }),
          fetch(endpoints.challenges, { signal: controller.signal }),
        ]);

        const [streakData, challengesData] = await Promise.all([
          streakResponse.json().catch(() => null),
          challengesResponse.json().catch(() => null),
        ]);

        if (!streakResponse.ok) {
          throw new Error(streakData?.detail || "Gagal mengambil data daily streak.");
        }

        if (!challengesResponse.ok) {
          throw new Error(challengesData?.detail || "Gagal mengambil progress weekly challenge.");
        }

        setStreak(getStreakValue(streakData));
        setChallenges(extractChallengeItems(challengesData).map(normalizeChallenge));
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data challenge.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchWeeklyChallengeData();

    return () => controller.abort();
  }, [endpoints.challenges, endpoints.streak]);

  const handleUpdateProgress = async (challengeId) => {
    setUpdatingChallengeId(challengeId);
    setError(null);

    try {
      const response = await fetch(endpoints.progress, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          increment: 1,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Progress challenge gagal diperbarui.");
      }

      const updatedChallenge = getUpdatedChallenge(data);

      setChallenges((currentChallenges) =>
        currentChallenges.map((challenge) => {
          if (challenge.id !== challengeId) return challenge;

          if (updatedChallenge?.id === challengeId) {
            return updatedChallenge;
          }

          const nextProgress = Math.min(challenge.target, challenge.progress + 1);

          return {
            ...challenge,
            progress: nextProgress,
            isCompleted: nextProgress >= challenge.target,
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui progress.");
    } finally {
      setUpdatingChallengeId(null);
    }
  };

  if (isLoading) {
    return (
      <section aria-busy="true" style={styles.card}>
        <div style={styles.loadingRow}>
          <LoaderCircle className="icon" style={styles.spinIcon} />
          <span style={styles.loadingText}>Memuat weekly challenge...</span>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Weekly Challenge dan Daily Streak" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Trophy className="icon" />
        </div>
        <div>
          <span style={styles.eyebrow}>EcoScan Challenge</span>
          <h2 style={styles.title}>Weekly Challenge</h2>
        </div>
        <div style={styles.streakBadge} title="Daily streak">
          <Flame className="icon" style={styles.flameIcon} />
          <strong>{streak}</strong>
          <span>hari</span>
        </div>
      </div>

      {error && (
        <div role="alert" style={styles.errorBox}>
          <AlertTriangle className="icon" />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.challengeList}>
        {challenges.length === 0 && (
          <div style={styles.emptyState}>
            <RotateCw className="icon" />
            <span>Belum ada tantangan mingguan dari backend.</span>
          </div>
        )}

        {challenges.map((challenge) => {
          const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
          const isUpdating = updatingChallengeId === challenge.id;

          return (
            <article key={challenge.id} style={styles.challengeItem}>
              <div style={styles.challengeTop}>
                <h3 style={styles.challengeTitle}>{challenge.title}</h3>
                {challenge.isCompleted && (
                  <span style={styles.completedBadge}>
                    <CheckCircle2 className="icon" />
                    Selesai
                  </span>
                )}
              </div>

              <div aria-label={`${progressPercent}% selesai`} style={styles.progressTrack}>
                <span style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
              </div>

              <div style={styles.challengeFooter}>
                <span style={styles.progressText}>
                  {challenge.progress}/{challenge.target} poin
                </span>
                <button
                  aria-label={`Kerjakan ${challenge.title}`}
                  disabled={challenge.isCompleted || isUpdating}
                  style={{
                    ...styles.updateButton,
                    ...(challenge.isCompleted || isUpdating ? styles.disabledButton : null),
                  }}
                  type="button"
                  onClick={() => handleUpdateProgress(challenge.id)}
                >
                  {isUpdating ? <LoaderCircle className="icon" style={styles.spinIcon} /> : <Plus className="icon" />}
                  <span>{isUpdating ? "Update" : "Kerjakan"}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  card: {
    display: "grid",
    gap: 16,
    margin: "16px 0",
    padding: 18,
    border: "1px solid rgba(11, 107, 67, 0.1)",
    borderRadius: 24,
    background:
      "linear-gradient(135deg, rgba(24, 184, 111, 0.12), rgba(245, 211, 123, 0.16)), #ffffff",
    boxShadow: "0 14px 34px rgba(11, 107, 67, 0.08)",
    color: "#17201b",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gap: 12,
    alignItems: "center",
  },
  headerIcon: {
    display: "grid",
    placeItems: "center",
    width: 44,
    height: 44,
    borderRadius: 16,
    background: "linear-gradient(135deg, #24c875, #0a9b59)",
    color: "#ffffff",
    boxShadow: "0 12px 24px rgba(10, 155, 89, 0.22)",
  },
  eyebrow: {
    display: "block",
    color: "#0b6b43",
    fontSize: "0.72rem",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  title: {
    margin: "4px 0 0",
    fontSize: "1.06rem",
    lineHeight: 1.2,
  },
  streakBadge: {
    display: "grid",
    gridTemplateColumns: "auto auto",
    alignItems: "center",
    gap: "2px 5px",
    minWidth: 74,
    padding: "8px 10px",
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.76)",
    color: "#0b6b43",
    textAlign: "center",
    boxShadow: "inset 0 0 0 1px rgba(11, 107, 67, 0.08)",
  },
  flameIcon: {
    gridRow: "span 2",
    color: "#e56a21",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 64,
  },
  loadingText: {
    color: "#52615a",
    fontSize: "0.9rem",
    fontWeight: 800,
  },
  spinIcon: {
    animation: "weeklyChallengeSpin 1s linear infinite",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    background: "rgba(229, 72, 77, 0.1)",
    color: "#b4232a",
    fontSize: "0.82rem",
    fontWeight: 800,
    lineHeight: 1.4,
  },
  challengeList: {
    display: "grid",
    gap: 12,
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    color: "#52615a",
    fontSize: "0.86rem",
    fontWeight: 800,
  },
  challengeItem: {
    display: "grid",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.86)",
    boxShadow: "inset 0 0 0 1px rgba(11, 107, 67, 0.07)",
  },
  challengeTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  challengeTitle: {
    margin: 0,
    minWidth: 0,
    color: "#17201b",
    fontSize: "0.94rem",
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },
  completedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    flex: "0 0 auto",
    minHeight: 26,
    padding: "0 9px",
    borderRadius: 999,
    background: "#e8f7ef",
    color: "#0b6b43",
    fontSize: "0.7rem",
    fontWeight: 900,
  },
  progressTrack: {
    overflow: "hidden",
    height: 10,
    borderRadius: 999,
    background: "#dfece5",
  },
  progressFill: {
    display: "block",
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(135deg, #24c875, #0a9b59)",
    transition: "width 220ms ease",
  },
  challengeFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressText: {
    color: "#52615a",
    fontSize: "0.82rem",
    fontWeight: 900,
  },
  updateButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 38,
    padding: "0 13px",
    border: 0,
    borderRadius: 999,
    background: "linear-gradient(135deg, #24c875, #0a9b59)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 900,
    boxShadow: "0 10px 22px rgba(10, 155, 89, 0.2)",
  },
  disabledButton: {
    cursor: "not-allowed",
    opacity: 0.62,
  },
};
