"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Folder,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Playground() {
  const [yearly, setYearly] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState("Active");
  const [seats, setSeats] = useState(4);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = "light";
  }, []);
  return (
    <main id="main-content" className="playground-page">
      <header className="playground-header">
        <span className="orbit-brand">
          <span className="orbit-symbol" />
          orbit
          <span className="orbit-divider" />
          Workspace
        </span>
        <span className="playground-label">INTERACTIVE PLAYGROUND</span>
        <Link href="/" data-trace-ignore>
          <ArrowLeft size={14} /> Back to Trace
        </Link>
      </header>
      <div className="playground-content">
        <div className="playground-intro">
          <span className="eyebrow">YOUR WORKSPACE, YOUR WAY</span>
          <h1>A little space for big ideas.</h1>
          <p>
            A real interface to explore. Every control changes something you can
            inspect.
          </p>
        </div>
        <div className="playground-grid">
          <section className="orbit-card" aria-label="Workspace plan">
            <div className="orbit-card-heading">
              <div>
                <span className="eyebrow">WORKSPACE PLAN</span>
                <h2>Room to grow.</h2>
              </div>
              <span className="orbit-pill">PRO</span>
            </div>
            <p className="orbit-muted">
              All your projects. One connected workspace.
            </p>
            <div className="orbit-billing">
              <button
                type="button"
                id="monthly-plan"
                aria-pressed={!yearly}
                onClick={() => setYearly(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                id="yearly-plan"
                aria-pressed={yearly}
                onClick={() => setYearly(true)}
              >
                Yearly <span>Save 20%</span>
              </button>
            </div>
            <div className="orbit-price">
              ${yearly ? "19" : "24"}
              <span>/ member, per month</span>
            </div>
            <ul className="orbit-benefits">
              <li>
                <Check size={16} /> Unlimited projects and collections
              </li>
              <li>
                <Check size={16} /> Shared spaces for your whole team
              </li>
              <li>
                <Check size={16} /> A clear view of every moving part
              </li>
            </ul>
            <button
              className="orbit-details"
              type="button"
              id="plan-details"
              onClick={() => dialog.current?.showModal()}
            >
              Explore your plan <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="orbit-card" aria-label="Team preferences">
            <span className="eyebrow">MAKE IT YOURS</span>
            <h2>Small details. Better days.</h2>
            <div className="orbit-setting">
              <div>
                <strong>Project updates</strong>
                <p>Keep up with what your team is making.</p>
              </div>
              <button
                type="button"
                id="project-updates"
                role="switch"
                aria-label="Project updates"
                aria-checked={notifications}
                className="orbit-switch"
                onClick={() => setNotifications(!notifications)}
              >
                <span />
              </button>
            </div>
            <div className="orbit-setting">
              <div>
                <strong>Team members</strong>
                <p>A seat for everyone in your orbit.</p>
              </div>
              <div className="orbit-stepper">
                <span aria-live="polite">{seats}</span>
                <button
                  type="button"
                  id="add-seat"
                  aria-label="Add a team seat"
                  onClick={() => setSeats(seats + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <button
              type="button"
              id="billing-faq"
              aria-expanded={expanded}
              aria-controls="billing-answer"
              className="orbit-disclosure"
              onClick={() => setExpanded(!expanded)}
            >
              Can I change my plan later?
              <ChevronDown size={16} />
            </button>
            {expanded && (
              <p id="billing-answer" className="orbit-answer">
                Of course. Switch plans whenever your team needs a little more
                room. Your projects stay right where they are.
              </p>
            )}
          </section>
          <section
            className="orbit-card orbit-projects"
            aria-label="Project collection"
          >
            <div className="orbit-card-heading">
              <div>
                <span className="eyebrow">GOOD THINGS IN PROGRESS</span>
                <h2>Your projects</h2>
              </div>
              <fieldset className="orbit-tabs" aria-label="Project status">
                {["Active", "Archived"].map((item) => (
                  <button
                    type="button"
                    id={`projects-${item.toLowerCase()}`}
                    key={item}
                    aria-pressed={tab === item}
                    onClick={() => setTab(item)}
                  >
                    {item}
                  </button>
                ))}
              </fieldset>
            </div>
            <div className="orbit-project-list">
              {(tab === "Active"
                ? ["Brand exploration", "The next chapter", "Website refresh"]
                : ["Spring collection"]
              ).map((name, index) => (
                <div className="orbit-project" key={name}>
                  <div className={`orbit-folder folder-${index}`}>
                    <Folder size={24} />
                  </div>
                  <div>
                    <strong>{name}</strong>
                    <p>
                      {index === 0
                        ? "Design system"
                        : index === 1
                          ? "Product direction"
                          : "Digital experience"}
                    </p>
                  </div>
                  <span className="orbit-avatar">
                    {["AL", "NK", "JM"][index]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <p className="playground-footnote">
          A purpose-built demo by Trace. No accounts, purchases, or external
          services.
        </p>
      </div>
      <dialog ref={dialog} className="orbit-dialog">
        <div className="orbit-card-heading">
          <h2>A plan that grows with you.</h2>
          <button
            type="button"
            aria-label="Close plan details"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          Pro brings your projects, people, and ideas into one workspace. This
          playground keeps every interaction local.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => dialog.current?.close()}
        >
          Got it <Check size={16} />
        </button>
      </dialog>
    </main>
  );
}
