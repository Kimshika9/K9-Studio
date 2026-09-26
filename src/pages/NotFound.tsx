import { Link } from "react-router-dom";
import { K9Mark } from "../brand/K9Mark";

export default function NotFound() {
  return (
    <section className="section-pad">
      <div className="shell flex flex-col items-center py-20 text-center">
        <K9Mark size={72} glowing />
        <h1 className="font-display mt-8 text-4xl font-bold tracking-tight">Lost in space</h1>
        <p className="muted mt-3 max-w-md">
          This page isn't part of the K9 universe (yet). Let's get you back to solid ground.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-k9 btn-primary">Back to homepage</Link>
          <Link to="/services" className="btn-k9 btn-ghost">Explore services</Link>
        </div>
      </div>
    </section>
  );
}
