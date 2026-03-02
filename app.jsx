const { useState, useEffect, useRef, useCallback } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SECRET_NAME = "Sara Correa Montes";
const SECRET_KEY = "sara_correa_montes_vitae_2026";
const APP_NAME = "SARÆ";
const GOLD = "#C9A96E";
const ROSE = "#D4909A";
const DARK = "#0A0708"; // New customized darker rich tone
const SUPABASE_URL = "https://czsiswqjixuhkkzzkitw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c2lzd3FqaXh1aGtrenpraXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDQzNjYsImV4cCI6MjA4Nzk4MDM2Nn0.zrfLJxHiSXkHajVDh2S7sk5RyymGoVEU8nLSPR8jZAA";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ─── ENCRYPTION UTILITIES ──────────────────────────────────────────────────
const encryptData = (text, key) => {
    if (!key) return text;
    try {
        return "E2EE:" + CryptoJS.AES.encrypt(text, key).toString();
    } catch (e) { return text; }
};

const decryptData = (text, key) => {
    if (!text || !text.startsWith("E2EE:")) return text;
    if (!key) return "Contenido Protegido (Falta llave)";
    try {
        const encrypted = text.replace("E2EE:", "");
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || "Llave incorrecta";
    } catch (e) { return "Error de Descifrado"; }
};

// ─── UTILITIES: IMAGE COMPRESSION ──────────────────────────────────────────
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
                }, "image/jpeg", 0.7); // 70% quality jpeg
            };
        };
    });
};

const INITIAL_MEMORIES = [
    { id: 1, date: "2026-01-14", title: "Un nuevo comienzo", type: "photo", tags: ["vida", "sueños"], excerpt: "El amanecer tiñó el cielo de un rosa suave. Sé que este año será diferente.", color: "#D4909A" },
    { id: 2, date: "2025-11-08", title: "Café en la montaña", type: "note", tags: ["paz"], excerpt: "A veces solo necesitas alejarte para escuchar tu propia voz. El viento frío, el aroma a café.", color: "#E0B0B6" },
    { id: 3, date: "2025-09-25", title: "Risas inesperadas", type: "video", tags: ["familia", "amor"], excerpt: "Esa cena que empezó normal y terminó en carcajadas hasta llorar. Así se ve la felicidad.", color: "#B8736A" },
    { id: 4, date: "2025-06-03", title: "El gran paso", type: "note", tags: ["trabajo", "cambio"], excerpt: "Nunca creí ser capaz de soltar esa seguridad, pero mis alas necesitaban espacio.", color: "#C9A96E" },
    { id: 5, date: "2025-02-21", title: "Mar de invierno", type: "photo", tags: ["naturaleza"], excerpt: "Las olas grises y la espuma. Hay una belleza inmensa en la melancolía del mar helado.", color: "#A0875E" },
    { id: 6, date: "2024-11-14", title: "Primera obra", type: "photo", tags: ["arte", "manos"], excerpt: "Mis manos manchadas de pintura, pero mi alma más limpia que nunca.", color: "#9B8EA0" },
];

// ─── CANVAS: CONSTELLATION ────────────────────────────────────────────────────
const StarField = ({ density = 70, isSara = false, animated = true }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);
        const W = () => canvas.width, H = () => canvas.height;

        // Create stars
        const stars = Array.from({ length: density }, () => ({
            x: Math.random(), y: Math.random(),
            r: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.7 + 0.1,
            speed: Math.random() * 0.5 + 0.05,
            phase: Math.random() * Math.PI * 2,
            special: Math.random() < 0.4,
        }));

        let frame = 0, raf;
        const draw = () => {
            ctx.clearRect(0, 0, W(), H());
            frame++;

            const themeColor = isSara ? "212,144,154" : "201,169,110";
            const secondaryColor = "232,227,223";

            stars.forEach(s => {
                const pulse = animated ? Math.sin(frame * s.speed * 0.03 + s.phase) * 0.35 + 0.65 : 1;
                ctx.beginPath();
                ctx.arc(s.x * W(), s.y * H(), s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.special ? `rgba(${themeColor},${s.opacity * pulse})` : `rgba(${secondaryColor},${s.opacity * pulse * 0.4})`;
                ctx.fill();

                // Add slight glow to special stars
                if (s.special && s.r > 1.2) {
                    ctx.beginPath();
                    ctx.arc(s.x * W(), s.y * H(), s.r * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${themeColor},${s.opacity * pulse * 0.1})`;
                    ctx.fill();
                }
            });

            // Connections
            stars.forEach((a, i) => {
                stars.slice(i + 1).forEach(b => {
                    const dx = (a.x - b.x) * W(), dy = (a.y - b.y) * H();
                    const dist = Math.hypot(dx, dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(a.x * W(), a.y * H());
                        ctx.lineTo(b.x * W(), b.y * H());
                        ctx.strokeStyle = `rgba(${themeColor},${(1 - dist / 100) * 0.08})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                });
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, [density, isSara, animated]);
    return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
};

// ─── FLOATING PETALS (Exclusively for Sara) ──────────────────────────────────
const PetalCanvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);

        const W = () => canvas.width, H = () => canvas.height;
        const petals = Array.from({ length: 30 }, () => ({
            x: Math.random() * W(), y: Math.random() * H() - H(),
            size: Math.random() * 10 + 5,
            speed: Math.random() * 1.2 + 0.4,
            drift: (Math.random() - 0.5) * 0.8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            opacity: Math.random() * 0.5 + 0.15,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.05 + 0.01,
        }));

        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, W(), H());
            petals.forEach(p => {
                p.wobble += p.wobbleSpeed;
                p.y += p.speed;
                p.x += p.drift + Math.sin(p.wobble) * 0.5;
                p.rotation += p.rotSpeed;

                if (p.y > H() + 30) {
                    p.y = -30; p.x = Math.random() * W();
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = p.opacity;

                // Draw elegant petal shape
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(p.size, p.size * 0.2, p.size * 1.5, p.size, 0, p.size * 1.8);
                ctx.bezierCurveTo(-p.size * 1.5, p.size, -p.size, p.size * 0.2, 0, 0);

                // Soft rose gradient
                const grad = ctx.createLinearGradient(0, 0, 0, p.size * 1.8);
                grad.addColorStop(0, "rgba(224,176,182,1)");
                grad.addColorStop(1, "rgba(212,144,154,0.6)");

                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />;
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor", style = {} }) => {
    const paths = {
        photo: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
        note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
        video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>,
        plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
        close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
        star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
        eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
        trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
        sparkle: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M16.24 5.64l-2.12 2.12M5.64 16.24l2.12 2.12" /></>,
        search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
        logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
        send: <><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></>,
        music: <><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></>,
        brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></>,
        map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></>,
        chart: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
            {paths[name]}
        </svg>
    );
};

// ─── AUTH LOGIC ──────────────────────────────────────────────────────────────
const useAuth = () => {
    const [session, setSession] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem("vitae_session") || "null"); } catch { return null; }
    });

    const [users, setUsers] = useState(() => {
        const sara = { id: SECRET_KEY, name: SECRET_NAME, email: "sara@vitae.app", isSara: true };
        try {
            const stored = JSON.parse(localStorage.getItem("vitae_users") || "null");
            if (!stored) { const u = { [SECRET_KEY]: sara }; localStorage.setItem("vitae_users", JSON.stringify(u)); return u; }
            if (!stored[SECRET_KEY]) stored[SECRET_KEY] = sara;
            return stored;
        } catch { return { [SECRET_KEY]: sara }; }
    });

    const login = useCallback((email, password) => {
        const found = Object.values(users).find(u => u.email === email && u.password === password);
        if (!found) throw new Error("Credenciales incorrectas o inexistentes.");
        const s = { ...found, loginAt: new Date().toISOString() };
        setSession(s); sessionStorage.setItem("vitae_session", JSON.stringify(s));
        return s;
    }, [users]);

    const register = useCallback((name, email, password) => {
        if (Object.values(users).find(u => u.email === email)) throw new Error("El correo ya está en uso.");
        const id = `user_${Date.now()}`;
        const newUser = { id, name, email, password, isSara: false };
        const updated = { ...users, [id]: newUser };
        setUsers(updated); localStorage.setItem("vitae_users", JSON.stringify(updated));
        const s = { ...newUser, loginAt: new Date().toISOString() };
        setSession(s); sessionStorage.setItem("vitae_session", JSON.stringify(s));
        return s;
    }, [users]);

    const secretLogin = useCallback(() => {
        const sara = { id: SECRET_KEY, name: SECRET_NAME, email: "sara@vitae.app", isSara: true };
        setSession(sara); sessionStorage.setItem("vitae_session", JSON.stringify(sara));
        return sara;
    }, []);

    const logout = useCallback(() => {
        setSession(null); sessionStorage.removeItem("vitae_session");
    }, []);

    return { session, login, register, secretLogin, logout };
};

// ─── ADVANCED ENIGMA ENTRY SCREEN ──────────────────────────────────────────────
const SecretEntry = ({ onUnlock, onRegularLogin }) => {
    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [shake, setShake] = useState(false);
    const inputRef = useRef(null);

    // Advanced 5-stage enigma unlock sequence tailored for Sara and Albert
    const puzzle = [
        {
            title: "¿Quién custodia esta esencia?",
            subtitle: "Invoca tu nombre completo para despertar el éter...",
            checker: s => s.toLowerCase().replace(/\s+/g, "") === "saracorreamontes",
            placeholder: "Tu nombre aquí..."
        },
        {
            title: "El Origen de su Luz",
            subtitle: "Medellín, Antioquia — El día en que el cielo se tiñó de rosa (DD/MM/AAAA)",
            checker: s => s.replace(/[-/.\s]/g, "") === "21092002" || s.replace(/[-/.\s]/g, "") === "210902" || s.replace(/[-/.\s]/g, "") === "020921",
            placeholder: "DD-MM-YYYY"
        },
        {
            title: "El Latido de la Tierra",
            subtitle: "Florencia, Caquetá — El despertar de una nueva fuerza (DD/MM/AAAA)",
            checker: s => s.replace(/[-/.\s]/g, "") === "11122009" || s.replace(/[-/.\s]/g, "") === "111209",
            placeholder: "DD-MM-YYYY"
        },
        {
            title: "La Convergencia",
            subtitle: "El instante infinito donde dos almas se volvieron una (DD/MM/AAAA)",
            checker: s => s.replace(/[-/.\s]/g, "") === "13062025" || s.replace(/[-/.\s]/g, "") === "130625",
            placeholder: "DD-MM-YYYY"
        },
        {
            title: "Las Seis Esencias",
            subtitle: "Pronuncia las palabras que mantienen vivo este universo...",
            checker: s => {
                const w = s.toLowerCase();
                return w.includes("amor") && w.includes("deseo") && w.includes("esperanza") && w.includes("vida") && w.includes("paz") && w.includes("tranquilidad");
            },
            placeholder: "Amor, deseo, esperanza..."
        }
    ];

    const handleSubmit = () => {
        if (step >= puzzle.length) return;
        if (puzzle[step].checker(input)) {
            const next = step + 1;
            setStep(next);
            setInput("");
            if (next === puzzle.length) {
                setTimeout(onUnlock, 4000); // Bloom sequence
            }
        } else {
            setShake(true);
            setTimeout(() => { setShake(false); setInput(""); }, 800);
        }
    };

    const isUnlocked = step >= puzzle.length;

    return (
        <div style={{ position: "fixed", inset: 0, background: DARK, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", overflow: "hidden" }}>
            <div className="grain" />
            <StarField density={80} isSara={true} />
            <PetalCanvas />

            <div style={{ position: "absolute", width: "90vmin", height: "90vmin", borderRadius: "50%", border: "1px solid rgba(212,144,154,0.03)", pointerEvents: "none", animation: "rotateSlow 70s linear infinite" }} />
            <div style={{ position: "absolute", width: "60vmin", height: "60vmin", borderRadius: "50%", border: "1px solid rgba(212,144,154,0.05)", pointerEvents: "none", animation: "rotateSlow 50s linear infinite reverse" }} />
            <div style={{ position: "absolute", width: "30vmin", height: "30vmin", borderRadius: "50%", border: "1px solid rgba(212,144,154,0.08)", pointerEvents: "none", animation: "rotateSlow 30s linear infinite" }} />

            {isUnlocked ? (
                <div style={{ textAlign: "center", animation: "bloom 1.5s ease-out forwards", zIndex: 10 }}>
                    <div style={{ fontSize: 72, marginBottom: 24, animation: "float 3s ease-in-out infinite" }}>
                        <Icon name="sparkle" size={60} color={ROSE} style={{ filter: "drop-shadow(0 0 20px rgba(212,144,154,0.5))" }} />
                    </div>
                    <h1 className="shimmer-text-rose" style={{ fontSize: 52, fontStyle: "italic", marginBottom: 16 }}>Nuestra Historia</h1>
                    <p className="text-overline" style={{ color: "var(--rose-dim)", letterSpacing: "0.5em" }}>este libro reconoce tu alma</p>
                    <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 16 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: ROSE, animation: `pulseGlow 1.5s ${i * 0.2}s ease-in-out infinite` }} />
                        ))}
                    </div>
                </div>
            ) : (
                <div key={step} style={{ textAlign: "center", maxWidth: 500, width: "100%", padding: "0 32px", zIndex: 10, animation: "fadeIn 1.2s ease forwards" }}>
                    <div style={{ marginBottom: 56 }}>
                        <div className="text-overline" style={{ color: ROSE, marginBottom: 16, opacity: 0.8, letterSpacing: "0.5em" }}>Sello de Memoria {step + 1} de {puzzle.length}</div>
                        <h2 style={{ fontSize: 38, fontStyle: "italic", color: "#E8E3DF", lineHeight: 1.2, marginBottom: 16, textShadow: "0 0 20px rgba(232,227,223,0.1)" }}>
                            {puzzle[step].title}
                        </h2>
                        <p style={{ color: "rgba(232,227,223,0.5)", fontStyle: "italic", fontSize: 16, maxWidth: "80%", margin: "0 auto" }}>{puzzle[step].subtitle}</p>
                    </div>

                    <div style={{
                        position: "relative", marginBottom: 32,
                        animation: shake ? "none" : undefined,
                        transform: shake ? "translateX(-12px)" : undefined,
                        transition: "all 0.1s"
                    }}>
                        <input
                            ref={inputRef}
                            autoFocus
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            placeholder={puzzle[step].placeholder}
                            style={{
                                background: "rgba(255,255,255,0.01)",
                                border: "none",
                                borderBottom: `1px solid ${shake ? "rgba(220,90,100,0.5)" : "rgba(255,255,255,0.15)"}`,
                                borderRadius: 0,
                                color: "#E8E3DF",
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 28, fontStyle: "italic",
                                padding: "16px 0",
                                width: "100%", textAlign: "center",
                                transition: "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                outline: "none",
                                letterSpacing: step === 0 ? "0" : "0.1em"
                            }}
                        />
                        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: input ? "100%" : "0%", height: 1, background: ROSE, transition: "width 0.8s ease" }} />
                    </div>

                    <button onClick={handleSubmit} className="btn-primary theme-sara" style={{ width: "100%", marginBottom: 40, padding: "20px 0", fontSize: 12, borderRadius: 30 }}>
                        Relevar Verdad
                    </button>

                    {step === 0 && (
                        <div className="fade-in-slow" style={{ animationDelay: "1s" }}>
                            <div style={{ position: "relative", marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)" }} />
                                <span style={{ margin: "0 24px", fontSize: 10, letterSpacing: "0.4em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>U ORÁCULO EXTERNO</span>
                            </div>
                            <button onClick={onRegularLogin} className="btn-ghost" style={{ width: "100%", border: "none", fontSize: 11, textDecoration: "underline", textUnderlineOffset: "6px" }}>
                                Acceder con cuenta existente
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── AUTH MODAL (Login/Register) ──────────────────────────────────────────────
const AuthModal = ({ onClose, onSuccess, login, register }) => {
    const [mode, setMode] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [err, setErr] = useState("");

    const submit = () => {
        setErr("");
        try {
            if (mode === "login") onSuccess(login(email, pass));
            else onSuccess(register(name, email, pass));
        } catch (e) { setErr(e.message); }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="glass-modal scale-in" style={{ maxWidth: 460, padding: "50px 40px" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
                    <div>
                        <p className="text-overline" style={{ color: "var(--gold-dim)", marginBottom: 12 }}>{APP_NAME} — ACCESO</p>
                        <h2 style={{ fontSize: 32, fontStyle: "italic", color: "#E8E3DF" }}>
                            {mode === "login" ? "Bienvenido de vuelta" : "Inicia tu historia"}
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ color: "var(--text-muted)", opacity: 0.7, padding: 4 }}><Icon name="close" size={20} /></button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
                    {mode === "register" && (
                        <div>
                            <label className="text-overline" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Nombre</label>
                            <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" />
                        </div>
                    )}
                    <div>
                        <label className="text-overline" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Correo</label>
                        <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
                    </div>
                    <div>
                        <label className="text-overline" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Contraseña</label>
                        <div style={{ position: "relative" }}>
                            <input className="input-field" type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" style={{ paddingRight: 48 }} />
                            <button
                                onClick={() => setShowPass(!showPass)}
                                style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                                <Icon name="eye" size={16} />
                            </button>
                        </div>
                    </div>

                    {err && (
                        <div style={{ padding: "12px 16px", background: "rgba(220,90,100,0.1)", border: "1px solid rgba(220,90,100,0.2)", borderRadius: 4, marginBottom: 24 }}>
                            <p style={{ fontSize: 14, color: "rgba(220,130,140,0.9)", fontStyle: "italic" }}>{err}</p>
                        </div>
                    )}

                    <button onClick={submit} className="btn-primary theme-standard" style={{ width: "100%", marginBottom: 24 }}>
                        {mode === "login" ? "Entrar a mi libro" : "Crear mi libro"}
                    </button>

                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                        <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ color: "var(--gold)", textDecoration: "underline", marginLeft: 4 }}>
                            {mode === "login" ? "Regístrate" : "Inicia sesión"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─── RICH TEXT EDITOR ──────────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, themeAccent, onInteraction }) => {
    const editorRef = useRef(null);

    // Initial content setup
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    const exec = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
        onChange(editorRef.current.innerHTML);
    };

    const actionBtnStyle = {
        padding: "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        color: "var(--text-main)", borderRadius: 4, cursor: "pointer", transition: "all 0.3s"
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label className="text-overline" style={{ color: "var(--text-muted)" }}>Contenido (Editor Avanzado)</label>
            <div style={{ border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, background: "rgba(10,7,8,0.4)" }}>
                {/* Format Toolbar */}
                <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                    <button onClick={() => exec("bold")} style={{ ...actionBtnStyle, fontWeight: "bold" }}>B</button>
                    <button onClick={() => exec("italic")} style={{ ...actionBtnStyle, fontStyle: "italic" }}>I</button>
                    <button onClick={() => exec("underline")} style={{ ...actionBtnStyle, textDecoration: "underline" }}>U</button>
                    <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />
                    <button onClick={() => exec("justifyLeft")} style={actionBtnStyle}>≡</button>
                    <button onClick={() => exec("justifyCenter")} style={actionBtnStyle}>≈</button>
                    <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />
                    <button onClick={() => exec("insertUnorderedList")} style={{ ...actionBtnStyle, letterSpacing: "0.2em" }}>• LISTA</button>
                </div>

                {/* Editable Area */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={e => { onChange(e.currentTarget.innerHTML); if (onInteraction) onInteraction(); }}
                    onBlur={e => { onChange(e.currentTarget.innerHTML); }}
                    onFocus={() => { if (onInteraction) onInteraction(); }}
                    placeholder="Escribe lo que quieras recordar. Selecciona el texto y usa los controles arriba para dar formato avanzado..."
                    className="rich-text-content"
                    style={{
                        outline: "none", padding: "24px", minHeight: "220px",
                        fontSize: "17px", lineHeight: 1.9, fontStyle: "italic",
                        color: "var(--text-main)", overflowY: "auto", maxHeight: "400px"
                    }}
                />
            </div>
        </div>
    );
};

// ─── ADD MEMORY MODAL ─────────────────────────────────────────────────────────
const AddMemoryModal = ({ isSara, onClose, onAdd, setTyping }) => {
    const [type, setType] = useState("note");
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [content, setContent] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const CONST_COLORS = isSara
        ? ["#D4909A", "#DEA4AD", "#C27A86", "#9E5B65", "#E4C3C8", "#9B8EA0", "#B2A4B8"] // Rose palette
        : ["#C9A96E", "#E8DCC8", "#8B9E7A", "#7A8BAA", "#9B8EA0", "#A0875E", "#836F52"]; // Standard palette

    const [color, setColor] = useState(CONST_COLORS[0]);
    const fileInputRef = useRef(null);

    const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput(""); };

    const uploadFile = async (file) => {
        if (!supabase) return null;

        let fileToUpload = file;
        if (file.type.startsWith("image/")) {
            fileToUpload = await compressImage(file);
        }

        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('media')
            .upload(filePath, fileToUpload);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const submit = async () => {
        if (!title.trim() || !content.trim()) return;
        setUploading(true);
        // Ensure typing stops when submitting
        if (setTyping) setTyping(false);

        let media_url = null;
        if (file) {
            media_url = await uploadFile(file);
        }

        onAdd({
            id: Date.now(),
            date,
            title,
            type,
            content,
            excerpt: content.replace(/<[^>]*>?/gm, '').slice(0, 140) + (content.length > 140 ? "..." : ""),
            tags,
            color,
            media_url
        });
        setUploading(false);
        onClose();
    };

    const themeClass = isSara ? "theme-sara" : "theme-standard";
    const themeAccent = isSara ? "var(--rose)" : "var(--gold)";

    return (
        <div className="overlay" onClick={onClose} style={{ zIndex: 300 }}>
            <div className={`glass-modal scale-in ${themeClass}`} style={{ maxWidth: 640, width: "100%", padding: "40px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                    <div>
                        <p className="text-overline" style={{ color: themeAccent, opacity: 0.6, marginBottom: 8 }}>Nueva memoria</p>
                        <h3 style={{ fontSize: 28, fontStyle: "italic", color: "#E8E3DF" }}>Preservar un momento</h3>
                    </div>
                    <button onClick={onClose} style={{ color: "var(--text-muted)" }}><Icon name="close" size={20} /></button>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                    {["note", "photo", "video"].map(t => (
                        <button key={t} onClick={() => setType(t)} style={{
                            flex: 1, padding: "14px",
                            background: type === t ? (isSara ? "rgba(212,144,154,0.12)" : "rgba(201,169,110,0.12)") : "rgba(255,255,255,0.02)",
                            border: `1px solid ${type === t ? (isSara ? "rgba(212,144,154,0.4)" : "rgba(201,169,110,0.4)") : "rgba(255,255,255,0.06)"}`,
                            borderRadius: "4px", color: type === t ? themeAccent : "var(--text-muted)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.3s"
                        }}>
                            <Icon name={t} size={16} />
                            <span className="text-overline" style={{ letterSpacing: "0.2em", margin: 0 }}>{t}</span>
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Media Selector */}
                    {(type === "photo" || type === "video") && (
                        <div style={{ border: `2px dashed rgba(255,255,255,0.1)`, borderRadius: 8, padding: 32, textAlign: "center", cursor: "pointer", position: "relative" }} onClick={() => fileInputRef.current.click()}>
                            <input type="file" ref={fileInputRef} hidden accept={type === "photo" ? "image/*" : "video/*"} onChange={e => setFile(e.target.files[0])} />
                            {file ? (
                                <p style={{ color: themeAccent, fontSize: 13 }}>{file.name} seleccionado (Haz clic para cambiar)</p>
                            ) : (
                                <div style={{ opacity: 0.6 }}>
                                    <Icon name={type} size={32} style={{ marginBottom: 12 }} />
                                    <p className="text-overline">Haz clic para subir {type === "photo" ? "una foto" : "un video"}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <input className="input-field" value={title}
                            onChange={e => setTitle(e.target.value)}
                            onFocus={() => setTyping && setTyping(true)}
                            onBlur={() => setTyping && setTimeout(() => setTyping(false), 2000)}
                            placeholder="El título de este recuerdo..."
                            style={{ fontSize: 20, fontStyle: "italic", background: "transparent", border: "none", borderBottom: `1px solid rgba(255,255,255,0.1)`, padding: "8px 0", width: "100%", outline: "none", color: "white" }} />
                    </div>
                    <div style={{ display: "flex", gap: 20 }}>
                        <div style={{ flex: 1 }}>
                            <label className="text-overline" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Fecha</label>
                            <input className="input-field" type="date" value={date}
                                onChange={e => setDate(e.target.value)}
                                onFocus={() => setTyping && setTyping(true)}
                                onBlur={() => setTyping && setTimeout(() => setTyping(false), 2000)} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-overline" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Color de Aura</label>
                            <div style={{ display: "flex", gap: 12, padding: "12px 0" }}>
                                {CONST_COLORS.slice(0, 6).map(c => (
                                    <button key={c} onClick={() => setColor(c)} style={{
                                        width: 28, height: 28, borderRadius: "50%", background: c,
                                        border: color === c ? `2px solid #E8E3DF` : `2px solid transparent`,
                                        transform: color === c ? "scale(1.2)" : "scale(1)", transition: "all 0.3s"
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <RichTextEditor value={content} onChange={setContent} themeAccent={themeAccent} onInteraction={() => setTyping && setTyping(true)} />

                    <div style={{ display: "flex", gap: 20 }}>
                        <div style={{ flex: 1 }}>
                            <label className="text-overline" style={{ display: "block", marginBottom: 8, color: "var(--text-muted)" }}>Etiquetas</label>
                            <div style={{ display: "flex", gap: 12 }}>
                                <input className="input-field" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="viaje, inspiración, familia..." />
                                <button onClick={addTag} className="btn-ghost" style={{ padding: "0 24px" }}>Add</button>
                            </div>
                            {tags.length > 0 && (
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                                    {tags.map(t => (
                                        <span key={t} className="tag" onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: `${themeAccent}15`, color: themeAccent, border: `1px solid ${themeAccent}40`, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                                            {t} <Icon name="close" size={10} />
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 40 }}>
                    <button onClick={onClose} className="btn-ghost" disabled={uploading}>Cancelar</button>
                    <button onClick={submit} className={`btn-primary ${themeClass}`} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Guardar Memoria"}
                    </button>
                </div>
            </div>
        </div>
    );
};
// ─── AI REFLECTION PANEL (THE ORACLE) ─────────────────────────────────────────
const AiPanel = ({ isSara, memories, onClose }) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: "oracle", text: "Soy la Consciencia de tus Memorias.\nEscribe lo que sientes o buscas entender de tu pasado..." }
    ]);
    const chatRef = useRef(null);

    const themeClass = isSara ? "theme-sara" : "theme-standard";
    const themeAccent = isSara ? "var(--rose)" : "var(--gold)";

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const callOracle = async () => {
        if (!query.trim() || loading) return;

        const userMsg = query.trim();
        setQuery("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);

        const geminiKey = localStorage.getItem('sarae_gemini_key');
        if (!geminiKey) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: "oracle", text: "Falta la llave del Oráculo (Gemini API Key). Actívala en los ajustes de la bóveda para hablar conmigo." }]);
                setLoading(false);
            }, 800);
            return;
        }

        try {
            // Context injection: give AI a summary of memories (decrypted locally)
            const memoryContext = memories.map(m => `[${m.date}] ${m.title}: ${m.excerpt}`).join('\n').slice(0, 4000);
            const prompt = `Eres el Oráculo de SARÆ, una consciencia que habita en el libro de recuerdos de Sara y Albert. 
            Eres poético, profundo y empático. Respondes en español.
            Tu conocimiento se basa en estos recuerdos:
            ${memoryContext}
            
            Pregunta del usuario: ${userMsg}`;

            const reply = await callGemini(prompt, geminiKey);
            setMessages(prev => [...prev, { role: "oracle", text: reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "oracle", text: "El éter está turbulento ahora mismo. Intenta preguntar de nuevo en un momento." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose} style={{ zIndex: 300 }}>
            <div className={`glass-modal scale-in ${themeClass}`} style={{ maxWidth: 640, width: "100%", padding: "40px", display: "flex", flexDirection: "column", height: "85vh" }} onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexShrink: 0 }}>
                    <div>
                        <p className="text-overline" style={{ color: themeAccent, opacity: 0.6, marginBottom: 8 }}>
                            <Icon name="brain" size={14} style={{ display: "inline", marginRight: 6 }} />
                            El Oráculo
                        </p>
                        <h3 style={{ fontSize: 24, fontStyle: "italic", color: "#E8E3DF" }}>Conversa con tu esencia</h3>
                    </div>
                    <button onClick={onClose} style={{ color: "var(--text-muted)", padding: 4 }}><Icon name="close" size={20} /></button>
                </div>

                <div ref={chatRef} className="chat-container fade-in-slow" style={{ flex: 1 }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`chat-bubble ${m.role} ${m.role === 'oracle' ? themeClass : ''}`}>
                            {m.text.split('\n').map((line, j) => <React.Fragment key={j}>{line}<br /></React.Fragment>)}
                        </div>
                    ))}
                    {loading && (
                        <div className={`chat-bubble oracle ${themeClass}`} style={{ width: 60, display: "flex", gap: 6, justifyContent: "center", alignItems: "center", padding: "16px" }}>
                            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: themeAccent, animation: `pulseGlow 1s ${i * 0.2}s ease-in-out infinite` }} />)}
                        </div>
                    )}
                </div>

                <div style={{ flexShrink: 0, marginTop: "auto", position: "relative" }}>
                    <textarea
                        value={query} onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); callOracle(); } }}
                        placeholder="Pregunta a tus recuerdos..."
                        className="input-field" style={{ height: 64, resize: "none", paddingRight: 60, background: "rgba(255,255,255,0.02)" }}
                    />
                    <button onClick={callOracle} style={{ position: "absolute", right: 12, top: 12, width: 40, height: 40, background: themeAccent, color: "var(--bg-dark)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${themeAccent}40` }}>
                        <Icon name="send" size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const callGemini = async (prompt, key) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

// ─── MEMORY DETAIL MODAL ──────────────────────────────────────────────────────
const MemoryDetail = ({ memory, isSara, onClose, onDelete }) => {
    const themeClass = isSara ? "theme-sara" : "theme-standard";

    return (
        <div className="overlay" onClick={onClose} style={{ zIndex: 250 }}>
            <div className={`glass-modal scale-in ${themeClass}`} style={{ maxWidth: 720, width: "100%", padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>

                {/* Header Art / Color Block */}
                <div style={{
                    height: 320, position: "relative",
                    background: `linear-gradient(135deg, ${memory.color}30, ${memory.color}10)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderBottom: `1px solid ${memory.color}20`,
                    overflow: "hidden"
                }}>
                    {memory.media_url ? (
                        memory.type === "video" ? (
                            <video src={memory.media_url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <img src={memory.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )
                    ) : (
                        <span style={{ color: memory.color, opacity: 0.3, fontSize: 80, filter: "blur(2px)" }}>
                            <Icon name={memory.type} size={100} />
                        </span>
                    )}

                    <div style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 16, zIndex: 10 }}>
                        {onDelete && <button onClick={() => onDelete(memory.id)} style={{ color: "var(--text-main)", background: "rgba(0,0,0,0.3)", borderRadius: "50%", padding: 10, backdropFilter: "blur(4px)" }}><Icon name="trash" size={16} /></button>}
                        <button onClick={onClose} style={{ color: "var(--text-main)", background: "rgba(0,0,0,0.3)", borderRadius: "50%", padding: 10, backdropFilter: "blur(4px)" }}><Icon name="close" size={16} /></button>
                    </div>
                </div>

                <div className="mobile-modal-padding" style={{ padding: "40px" }}>
                    <p className="text-overline" style={{ color: memory.color, marginBottom: 12 }}>
                        {new Date(memory.date).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h2 style={{ fontSize: "clamp(24px, 5vw, 38px)", fontStyle: "italic", color: "#E8E3DF", marginBottom: 32 }}>{memory.title}</h2>

                    <div
                        className="rich-text-content fade-in"
                        style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 2, margin: "0 0 40px", fontStyle: "italic", whiteSpace: "pre-wrap" }}
                        dangerouslySetInnerHTML={{ __html: memory.content || memory.excerpt }}
                    />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
                        {(memory.tags || []).map(t => (
                            <span key={t} className="tag" style={{ background: `${memory.color}15`, color: memory.color, border: `1px solid ${memory.color}30` }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── ATLAS (STATISTICS AND MEMORY GRAPH TREE) ─────────────────────────────────
const AtlasView = ({ memories, isSara }) => {
    const themeAccent = isSara ? "var(--rose)" : "var(--gold)";
    const themeClass = isSara ? "theme-sara" : "theme-standard";

    const totalWords = memories.reduce((acc, m) => acc + (m.content ? m.content.split(/\s+/).length : m.excerpt.split(/\s+/).length), 0);
    const totalTags = [...new Set(memories.flatMap(m => m.tags || []))].length;
    const moodScore = memories.length * 12;

    // Node placement logic for Graph Tree
    const nodes = memories.map((m, i) => {
        // Distribute nodes in a polar circle for better aesthetic tree
        const radius = 30 + (i % 3) * 10;
        const angle = (i / memories.length) * Math.PI * 2;
        const top = 50 + Math.sin(angle) * radius;
        const left = 50 + Math.cos(angle) * radius;
        return { ...m, top, left };
    });

    const lines = [];
    nodes.forEach((n1, i) => {
        nodes.slice(i + 1).forEach(n2 => {
            const sharedTags = (n1.tags || []).filter(t => (n2.tags || []).includes(t));
            if (sharedTags.length > 0) {
                lines.push({ x1: n1.left, y1: n1.top, x2: n2.left, y2: n2.top, shared: sharedTags[0] });
            }
        });
    });

    return (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                <div className="memory-card" style={{ flex: "1 1 200px" }}>
                    <p className="text-overline" style={{ color: "var(--text-muted)" }}>Total Palabras</p>
                    <h2 style={{ fontSize: 44, color: themeAccent, fontFamily: "'Cormorant Garamond', serif", marginTop: 8 }}>{totalWords}</h2>
                    <p style={{ fontSize: 13, fontStyle: "italic", opacity: 0.6, marginTop: 4 }}>palabras en el éter</p>
                </div>
                <div className="memory-card" style={{ flex: "1 1 200px" }}>
                    <p className="text-overline" style={{ color: "var(--text-muted)" }}>Neural Nodes</p>
                    <h2 style={{ fontSize: 44, color: themeAccent, fontFamily: "'Cormorant Garamond', serif", marginTop: 8 }}>{totalTags}</h2>
                    <p style={{ fontSize: 13, fontStyle: "italic", opacity: 0.6, marginTop: 4 }}>conexiones conceptuales</p>
                </div>
                <div className="memory-card" style={{ flex: "1 1 200px" }}>
                    <p className="text-overline" style={{ color: "var(--text-muted)" }}>Intensidad Vibracional</p>
                    <h2 style={{ fontSize: 44, color: themeAccent, fontFamily: "'Cormorant Garamond', serif", marginTop: 8 }}>{moodScore}<span style={{ fontSize: 20 }}>Hz</span></h2>
                    <p style={{ fontSize: 13, fontStyle: "italic", opacity: 0.6, marginTop: 4 }}>frecuencia de este libro</p>
                </div>
            </div>

            <div className="memory-card atlas-graph-card" style={{ padding: 0, height: 480, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='${isSara ? '%23D4909A' : '%23C9A96E'}' stroke-width='0.5' stroke-opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")` }} />

                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    {lines.map((l, idx) => (
                        <g key={idx}>
                            <line
                                x1={`${l.x1}%`} y1={`${l.y1}%`} x2={`${l.x2}%`} y2={`${l.y2}%`}
                                stroke={themeAccent} strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 4"
                                style={{ animation: `fadeInSlow 2s ${Math.random()}s forwards`, opacity: 0 }}
                            />
                            <text x={`${(l.x1 + l.x2) / 2}%`} y={`${(l.y1 + l.y2) / 2}%`} fill="var(--text-muted)" fontSize="8" letterSpacing="0.2em" textAnchor="middle" dy="-4" opacity="0.6" style={{ background: "rgba(0,0,0,0.5)" }}>
                                {l.shared}
                            </text>
                        </g>
                    ))}
                </svg>

                {nodes.map((m, i) => (
                    <div key={m.id} style={{ position: "absolute", top: `${m.top}%`, left: `${m.left}%`, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", animation: `fadeIn 1s ${i * 0.1}s forwards`, opacity: 0 }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: m.color, border: "2px solid rgba(10,7,8,0.8)", boxShadow: `0 0 25px ${m.color}`, cursor: "pointer", transition: "transform 0.3s" }} className="node-hover" />
                        <div style={{ marginTop: 8, fontSize: 10, fontFamily: "serif", fontStyle: "italic", color: m.color, backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 4, background: "rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>{m.title.slice(0, 18)}</div>
                    </div>
                ))}

                <div style={{ position: "absolute", bottom: 20, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h3 style={{ fontSize: 26, fontStyle: "italic", color: "#E8E3DF" }}>Memory Graph Tree</h3>
                        <p className="text-overline" style={{ opacity: 0.6 }}>Red Neuronal de Recuerdos</p>
                    </div>
                    <Icon name="chart" size={40} color={themeAccent} style={{ opacity: 0.1 }} />
                </div>
            </div>
        </div>
    );
};

// ─── SANTUARIO DE ECOS (ENCRYPTED CHAT) ───────────────────────────────────────
const SantuarioView = ({ session, vaultKey, isSara }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const themeAccent = isSara ? "var(--rose)" : "var(--gold)";
    const themeClass = isSara ? "theme-sara" : "theme-standard";

    const fetchEchoes = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('echoes')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100);

        if (data) {
            const decrypted = data.map(m => ({
                ...m,
                text: decryptData(m.text, vaultKey)
            }));
            setMessages(decrypted);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEchoes();
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

        const channel = supabase.channel('santuario_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'echoes' }, payload => {
                const newMsg = {
                    ...payload.new,
                    text: decryptData(payload.new.text, vaultKey)
                };
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendEcho = async () => {
        const text = input.trim();
        if (!text || !supabase) return;
        setInput("");

        const encrypted = encryptData(text, vaultKey);
        const { error } = await supabase.from('echoes').insert([{
            text: encrypted,
            sender_id: session.id,
            sender_name: session.name
        }]);

        if (error) console.error("Echo error:", error);
    };

    return (
        <div className="santuario-view fade-in">
            <div className="echo-messages" ref={scrollRef}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 40, opacity: 0.4 }}>Conectando con el éter...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, opacity: 0.4, fontStyle: "italic" }}>El santuario está en silencio. Inicia un eco.</div>
                ) : messages.map((m, i) => (
                    <div key={m.id || i} className={`echo-bubble ${m.sender_id === session.id ? 'me' : 'them'}`}>
                        <div className="echo-text">{m.text}</div>
                        <span className="echo-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ))}
            </div>

            <div className="echo-input-container">
                <input
                    className="input-field"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendEcho()}
                    placeholder="Escribe un eco cifrado..."
                    style={{ border: "none", background: "transparent", fontSize: 16 }}
                />
                <button onClick={sendEcho} style={{ color: themeAccent }}>
                    <Icon name="send" size={20} />
                </button>
            </div>
        </div>
    );
};

// ─── MAIN APP VIEW ────────────────────────────────────────────────────────────
const VitaeApp = ({ session, logout }) => {
    const isSara = session.isSara;

    const themeClass = isSara ? "theme-sara" : "theme-standard";
    const themeAccent = isSara ? "var(--rose)" : "var(--gold)";

    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("timeline");
    const [activeId, setActiveId] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [greeting, setGreeting] = useState(true);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [onlineOthers, setOnlineOthers] = useState(0);
    const [othersTyping, setOthersTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [pingActive, setPingActive] = useState(false);
    const [vaultKey, setVaultKey] = useState(localStorage.getItem('sarae_vault_key') || "");
    const [geminiKey, setGeminiKey] = useState(localStorage.getItem('sarae_gemini_key') || "");
    const [vaultOpen, setVaultOpen] = useState(false);
    const audioRef = useRef(null);

    // ─── AUDIO ENGINE (CRYSTAL ECHO) ──────────────────────────────────────────
    const playEcho = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1);
        } catch (e) { }
    };

    // ─── REALTIME & PRESENCE ──────────────────────────────────────────────────
    const presenceChannel = useRef(null);

    useEffect(() => {
        if (!supabase) return;

        const channel = supabase.channel('sarae_presence', {
            config: { presence: { key: session.id } }
        });
        presenceChannel.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const others = Object.values(state).flat().filter(p => p.id !== session.id);
                setOnlineOthers(others.length);
                setOthersTyping(others.some(p => p.isTyping));
            })
            .on('broadcast', { event: 'ping' }, () => {
                setPingActive(true);
                playEcho();
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setTimeout(() => setPingActive(false), 3000);
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [session.id]);

    // Track state changes (Typing)
    useEffect(() => {
        if (presenceChannel.current) {
            presenceChannel.current.track({
                id: session.id,
                user: session.name,
                isTyping: isTyping,
                online_at: new Date().toISOString(),
            });
        }
    }, [isTyping, session.id, session.name]);

    const sendPing = () => {
        if (!supabase || !presenceChannel.current) return;
        presenceChannel.current.send({
            type: 'broadcast',
            event: 'ping',
            payload: { from: session.name }
        });
        setPingActive(true);
        setTimeout(() => setPingActive(false), 1000);
    };

    // Fetch from Supabase (Delta Sync)
    useEffect(() => {
        const fetchMems = async () => {
            if (!supabase) {
                const stored = JSON.parse(localStorage.getItem(`vitae_mem_${session.id}`));
                setMemories(stored || (isSara ? INITIAL_MEMORIES : []));
                setLoading(false);
                return;
            }

            // Delta sync: only fetch if memories are empty or on first load
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .order('date', { ascending: false });

            if (data) {
                const decrypted = data.map(m => ({
                    ...m,
                    title: decryptData(m.title, vaultKey),
                    content: decryptData(m.content, vaultKey),
                    excerpt: decryptData(m.content, vaultKey).replace(/<[^>]*>?/gm, '').slice(0, 140)
                }));
                setMemories(decrypted);
            }
            setLoading(false);
        };

        fetchMems();

        // Real-time subscription
        let subscription;
        if (supabase) {
            subscription = supabase
                .channel('public:memories')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, payload => {
                    fetchMems();
                })
                .subscribe();
        }

        return () => { if (subscription) supabase.removeChannel(subscription); };
    }, [session.id]);

    useEffect(() => { const t = setTimeout(() => setGreeting(false), 4500); return () => clearTimeout(t); }, []);

    useEffect(() => {
        // High quality ambient loop (Rain loop from a stable public CDN)
        audioRef.current = new Audio("https://github.com/rafaelcastrocouto/audio/raw/master/rain.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;
    }, []);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (audioPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => {
                console.warn("Audio playback failed or was blocked:", e);
                // Note: Most browsers require a user interaction (click) before playing audio.
            });
        }
        setAudioPlaying(!audioPlaying);
    };

    const handleAdd = async (m) => {
        // Save to state immediately for UX (Optimistic UI)
        const tempId = m.id;
        const newMems = [m, ...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
        setMemories(newMems);

        if (supabase) {
            const { data, error } = await supabase.from('memories').insert([{
                date: m.date,
                title: encryptData(m.title, vaultKey),
                content: encryptData(m.content, vaultKey),
                type: m.type,
                tags: m.tags,
                color: m.color,
                media_url: m.media_url,
                user_id: session.id
            }]).select();

            if (error) {
                console.error("Error saving to Supabase:", error);
            } else if (data && data[0]) {
                // Update the memory in state with the real UUID from Supabase
                const realMem = {
                    ...data[0],
                    title: m.title,
                    content: m.content,
                    excerpt: m.excerpt
                };
                setMemories(prev => prev.map(item => item.id === tempId ? realMem : item));
            }
        } else {
            localStorage.setItem(`vitae_mem_${session.id}`, JSON.stringify(newMems));
        }
    };

    const handleDelete = async (id) => {
        setActiveId(null);
        // Optimistic delete
        const remaining = memories.filter(m => m.id !== id);
        setMemories(remaining);

        if (supabase) {
            // Only try to delete from DB if ID is a valid UUID (usually contains -)
            const isUuid = typeof id === 'string' && id.includes('-');
            if (isUuid) {
                const { error } = await supabase.from('memories').delete().eq('id', id);
                if (error) console.error("Error deleting from Supabase:", error);
            }
        } else {
            localStorage.setItem(`vitae_mem_${session.id}`, JSON.stringify(remaining));
        }
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(memories, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `sarae_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const filtered = memories.filter(m =>
        !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.tags || []).some(t => t.includes(search.toLowerCase())) ||
        (m.excerpt || "").toLowerCase().includes(search.toLowerCase())
    );

    const activeMem = memories.find(m => m.id === activeId);

    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
    const name = session.name.split(" ")[0];

    return (
        <div className={`theme-wrapper ${themeClass}`} style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div className="grain" />
            <StarField density={isSara ? 80 : 50} isSara={isSara} />
            {isSara && <PetalCanvas />}

            {/* Elegant Ambient Background Glow */}
            <div style={{ position: "fixed", top: "10%", right: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: `radial-gradient(circle, ${isSara ? "rgba(212,144,154,0.04)" : "rgba(201,169,110,0.04)"} 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "fixed", bottom: "10%", left: "5%", width: "50vw", height: "50vw", borderRadius: "50%", background: `radial-gradient(circle, ${isSara ? "rgba(168,90,105,0.03)" : "rgba(100,120,150,0.02)"} 0%, transparent 70%)`, filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

            {/* Welcome Toast */}
            {greeting && (
                <div className="glass-modal fade-in" style={{
                    position: "fixed", top: 100, right: 40, zIndex: 400, padding: "20px 24px",
                    borderLeft: `3px solid ${themeAccent}`, maxWidth: 300
                }}>
                    <p className="text-overline" style={{ color: themeAccent, marginBottom: 8 }}>{isSara ? "✦ Tu espacio privado" : "✦ Conexión establecida"}</p>
                    <p style={{ fontSize: 16, fontStyle: "italic", margin: 0 }}>{timeGreet}, {name}.</p>
                </div>
            )}

            {/* Header */}
            <header style={{ position: "relative", zIndex: 50, borderBottom: "1px solid var(--border-subtle)", background: "rgba(10,7,8,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
                <div className="container header-content" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16, cursor: "pointer", position: "relative" }} onClick={() => { setView("timeline"); sendPing(); }}>
                        <span className={isSara ? "shimmer-text-rose" : "shimmer-text-gold"} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, letterSpacing: "0.2em" }}>{APP_NAME}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="text-overline" style={{ color: "var(--text-muted)" }}>{isSara ? "De Sara Correa Montes" : "Libro de Vida"}</span>
                            {onlineOthers > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 10px #4ADE80", animation: "pulse 2s infinite" }} />
                                    {othersTyping && (
                                        <span className="text-overline" style={{ fontSize: 8, color: themeAccent, animation: "fadeInSlow 1s infinite alternate" }}>Creando...</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {pingActive && (
                            <div style={{
                                position: "absolute", inset: -10, borderRadius: "50%",
                                border: `2px solid ${themeAccent}`,
                                animation: "pingAnimation 1.5s ease-out forwards",
                                pointerEvents: "none"
                            }} />
                        )}
                    </div>

                    <nav style={{ display: "flex", gap: 32, display: "none" }} className="desktop-nav">
                        {/* We can hide these items for mobile if we add media queries, but let's keep it simple */}
                    </nav>

                    <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {["timeline", "galería", "atlas", "santuario"].map(v => (
                            <button key={v} onClick={() => setView(v)} className={`nav-link ${view === v ? "active" : ""}`} style={{ marginRight: 8 }}>{v === 'santuario' ? 'Santuario' : v}</button>
                        ))}

                        <div style={{ position: "relative" }}>
                            <input
                                className="input-field search-input"
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                style={{ padding: "8px 16px 8px 36px", fontSize: 13, background: "rgba(255,255,255,0.03)", width: 180, borderRadius: 30 }}
                            />
                            <Icon name="search" size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        </div>

                        <button onClick={() => setAiOpen(true)} className={`btn-primary ${themeClass} desktop-nav-items`} style={{ padding: "8px 16px", borderRadius: 30 }}>
                            <Icon name="brain" size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} /> Oráculo
                        </button>

                        <button onClick={exportData} title="Exportar Copia de Seguridad" style={{ color: "var(--text-muted)", opacity: 0.6, marginLeft: 8 }} className="desktop-nav-items">
                            <Icon name="note" size={16} />
                        </button>

                        <button onClick={toggleAudio} className={`audio-btn ${audioPlaying ? 'playing' : ''}`} title="Lluvia / Ambiente">
                            <Icon name="music" size={16} color={audioPlaying ? themeAccent : "var(--text-muted)"} />
                        </button>

                        <button onClick={logout} style={{ color: "var(--text-muted)", opacity: 0.6, marginLeft: 8 }} title="Cerrar sesión">
                            <Icon name="logout" size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container" style={{ position: "relative", zIndex: 10, flex: 1, paddingTop: 60, paddingBottom: 100 }}>

                {/* Hero Section */}
                <div style={{ marginBottom: 60, maxWidth: 640 }} className="fade-in">
                    <p className="text-overline" style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                        — {new Date().toLocaleDateString("es", { month: "long", year: "numeric" })} —
                    </p>
                    <h1 style={{ fontSize: isSara ? 56 : 48, lineHeight: 1.15, marginBottom: 20 }}>
                        {isSara ? <><span style={{ color: "#E8E3DF" }}>Tu jardín secreto,</span><br /><em style={{ color: themeAccent }}>tus memorias.</em></> : <><span style={{ color: "#E8E3DF" }}>El archivo de</span><br /><em style={{ color: themeAccent }}>tu existencia.</em></>}
                    </h1>
                    <p style={{ fontSize: 16, color: "var(--text-muted)", fontStyle: "italic" }}>
                        {filtered.length} momentos cristalizados en el tiempo.
                    </p>
                </div>

                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="memory-card" style={{ height: 160, opacity: 0.3, animation: "pulseGlow 2s infinite" }}>
                                <div style={{ height: 20, width: "40%", background: themeAccent, borderRadius: 4, marginBottom: 16 }} />
                                <div style={{ height: 14, width: "80%", background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 8 }} />
                                <div style={{ height: 14, width: "60%", background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && view === "timeline" && (
                    <div style={{ position: "relative" }} className="fade-in">
                        <div className="timeline-line"></div>

                        {filtered.length === 0 && (
                            <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                                <Icon name="star" size={32} style={{ opacity: 0.3, marginBottom: 16 }} />
                                <p>El lienzo está en blanco. Guarda tu primer recuerdo.</p>
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {filtered.map((m, i) => (
                                <div key={m.id} className="timeline-row" style={{ display: "flex", alignItems: "flex-start", gap: 40, padding: "32px 0", position: "relative" }}>

                                    {/* Date Block */}
                                    <div className="timeline-date" style={{ width: 80, flexShrink: 0, textAlign: "right", paddingTop: 6 }}>
                                        <div className="text-overline" style={{ color: "var(--text-muted)", marginBottom: 4 }}>{new Date(m.date).toLocaleDateString("es", { month: "short" })}</div>
                                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontStyle: "italic", color: m.color, lineHeight: 1 }}>{new Date(m.date).getDate()}</div>
                                        <div className="text-overline" style={{ color: "var(--text-muted)", opacity: 0.5, marginTop: 4 }}>{new Date(m.date).getFullYear()}</div>
                                    </div>

                                    {/* Node */}
                                    <div className="timeline-node" style={{ flexShrink: 0, width: 40, display: "flex", justifyContent: "center", paddingTop: 16 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, border: `2px solid var(--bg-dark)`, boxShadow: `0 0 16px ${m.color}80, inset 0 0 4px rgba(255,255,255,0.8)`, transition: "transform 0.3s" }} className="node-dot" />
                                    </div>

                                    {/* Card */}
                                    <div className="memory-card" style={{ flex: 1, maxWidth: 640 }} onClick={() => setActiveId(m.id)}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                            <h3 style={{ fontSize: 22, fontStyle: "italic", color: "#E8E3DF" }}>{m.title}</h3>
                                            <Icon name={m.type} size={16} color={m.color} style={{ opacity: 0.8 }} />
                                        </div>
                                        {m.media_url && (
                                            <div style={{ width: "100%", height: 120, borderRadius: 4, overflow: "hidden", marginBottom: 16, background: "rgba(255,255,255,0.03)" }}>
                                                {m.type === "photo" ? (
                                                    <img src={m.media_url} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `${m.color}10` }}>
                                                        <Icon name="video" size={32} color={m.color} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, fontStyle: "italic", marginBottom: 20 }}>
                                            {m.excerpt}
                                        </p>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {(m.tags || []).map(t => <span key={t} className="tag" style={{ border: `1px solid ${m.color}20`, color: m.color }}>{t}</span>)}
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── GALLERY VIEW ── */}
                {!loading && view === "galería" && (
                    <div className="masonry-grid fade-in">
                        {filtered.map((m, i) => (
                            <div key={m.id} className="masonry-item memory-card" onClick={() => setActiveId(m.id)} style={{
                                padding: "24px",
                                minHeight: (i % 3 === 0) ? 280 : 200,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                background: m.media_url && m.type === 'photo'
                                    ? `linear-gradient(to top, rgba(10,7,8,0.9), transparent), url(${m.media_url}) center/cover no-repeat`
                                    : `linear-gradient(160deg, var(--bg-card), ${m.color}15)`,
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                {m.media_url && m.type === 'video' && (
                                    <video src={m.media_url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, zIndex: 0 }} muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                )}
                                <div style={{ position: "absolute", top: 20, right: 20, opacity: 0.5, zIndex: 2 }}><Icon name={m.type} size={16} color={m.color} /></div>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='${m.color.replace('#', '%23')}' fill-opacity='0.1'/%3E%3C/svg%3E")`, pointerEvents: "none", zIndex: 1 }} />
                                <div style={{ zIndex: 2 }}>
                                    <p className="text-overline" style={{ color: m.color, marginBottom: 8, opacity: 0.8 }}>
                                        {new Date(m.date).toLocaleDateString("es", { day: "numeric", month: "long" })}
                                    </p>
                                    <h3 style={{ fontSize: 20, fontStyle: "italic", color: "#E8E3DF", marginBottom: 12 }}>{m.title}</h3>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: m.excerpt.slice(0, 80) + (m.excerpt.length > 80 ? "..." : "") }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* ── ATLAS VIEW ── */}
                {!loading && view === "atlas" && <AtlasView memories={filtered} isSara={isSara} />}

                {!loading && view === "santuario" && <SantuarioView session={session} vaultKey={vaultKey} isSara={isSara} />}

            </main>

            {/* FAB */}
            <button onClick={() => setAddOpen(true)} className={`fab ${themeClass}`}>
                <Icon name="plus" size={26} />
            </button>

            {isSara && (
                <div style={{ position: "fixed", bottom: 16, width: "100%", textAlign: "center", zIndex: 1, pointerEvents: "none" }} className="fade-in-slow">
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "var(--rose)", opacity: 0.4, letterSpacing: "0.15em" }}>
                        Diseñado exclusivamente para Sara Correa Montes ✦
                    </p>
                </div>
            )}

            {/* MOBILE NAV BAR */}
            <div className="mobile-nav">
                <button className={`mobile-nav-btn ${view === 'timeline' ? `active ${themeClass}` : ''}`} onClick={() => setView("timeline")}>
                    <Icon name="note" size={20} />
                    <span className="mobile-nav-text">Memoria</span>
                </button>
                <button className={`mobile-nav-btn ${view === 'santuario' ? `active ${themeClass}` : ''}`} onClick={() => setView("santuario")}>
                    <Icon name="brain" size={20} />
                    <span className="mobile-nav-text">Santuario</span>
                </button>
                <button className={`mobile-nav-add-btn ${themeClass}`} onClick={() => setAddOpen(true)}>
                    <Icon name="plus" size={24} />
                </button>
                <button className={`mobile-nav-btn ${view === 'galería' ? `active ${themeClass}` : ''}`} onClick={() => setView("galería")}>
                    <Icon name="photo" size={20} />
                    <span className="mobile-nav-text">Galería</span>
                </button>
                <button className={`mobile-nav-btn ${view === 'atlas' ? `active ${themeClass}` : ''}`} onClick={() => setView("atlas")}>
                    <Icon name="chart" size={20} />
                    <span className="mobile-nav-text">Atlas</span>
                </button>
            </div>

            {/* Modals */}
            {addOpen && <AddMemoryModal isSara={isSara} onClose={() => { setAddOpen(false); setIsTyping(false); }} onAdd={handleAdd} setTyping={setIsTyping} />}
            {aiOpen && <AiPanel isSara={isSara} memories={memories} onClose={() => setAiOpen(false)} />}
            {activeMem && <MemoryDetail memory={activeMem} isSara={isSara} onClose={() => setActiveId(null)} onDelete={handleDelete} />}

            {/* Vault Key Modal */}
            {vaultOpen && (
                <div className="overlay" style={{ zIndex: 1000 }} onClick={() => setVaultOpen(false)}>
                    <div className={`glass-modal scale-in ${themeClass}`} style={{ maxWidth: 420, padding: 32 }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <Icon name="lock" size={48} color={themeAccent} style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 24, fontStyle: "italic" }}>Ajustes de la Bóveda</h3>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Configura la seguridad y la inteligencia de tu libro.</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            <div>
                                <label className="text-overline" style={{ color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Llave de Cifrado (E2EE)</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={vaultKey}
                                    onChange={(e) => {
                                        setVaultKey(e.target.value);
                                        localStorage.setItem('sarae_vault_key', e.target.value);
                                    }}
                                    placeholder="Contraseña secreta..."
                                    style={{ fontSize: 16, letterSpacing: "0.2em" }}
                                />
                                <p style={{ fontSize: 10, color: "rgba(220,90,100,0.6)", marginTop: 6, fontStyle: "italic" }}>Si cambias la llave, los recuerdos cifrados no se podrán leer.</p>
                            </div>

                            <div>
                                <label className="text-overline" style={{ color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Google Gemini API Key</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={geminiKey}
                                    onChange={(e) => {
                                        setGeminiKey(e.target.value);
                                        localStorage.setItem('sarae_gemini_key', e.target.value);
                                    }}
                                    placeholder="AI Key del Oráculo..."
                                    style={{ fontSize: 16 }}
                                />
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{ fontSize: 10, color: themeAccent, marginTop: 6, display: "block", textDecoration: "underline" }}>Obtén tu llave gratuita aquí</a>
                            </div>

                            <button
                                className={`btn-primary ${themeClass}`}
                                style={{ width: "100%", marginTop: 8 }}
                                onClick={() => { setVaultOpen(false); window.location.reload(); }}
                            >
                                Guardar y Sincronizar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// ─── ROOT CONTAINER ───────────────────────────────────────────────────────────
export default function Root() {
    const { session, login, register, secretLogin, logout } = useAuth();
    const [screen, setScreen] = useState("secret");

    useEffect(() => { if (session) setScreen("app"); }, [session]);

    const handleSecret = () => {
        secretLogin();
        setScreen("app");
    };

    if (screen === "app" && session) {
        return <VitaeApp session={session} logout={() => { logout(); setScreen("secret"); }} />;
    }

    if (screen === "auth") {
        return (
            <div style={{ position: "relative", minHeight: "100vh", background: DARK }}>
                <StarField density={50} />
                <div className="grain" />
                <AuthModal onClose={() => setScreen("secret")} onSuccess={() => setScreen("app")} login={login} register={register} />
            </div>
        );
    }

    return <SecretEntry onUnlock={handleSecret} onRegularLogin={() => setScreen("auth")} />;
}

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);
