import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DigitalCard } from "../src/components/digital-card/DigitalCard";

describe("DigitalCard Component", () => {
  it("renders card identity details properly", () => {
    render(
      <DigitalCard
        name="Alex Jordan"
        designation="Creative Director"
        companyName="Innovative Spaces"
        phoneNumber="+91 98765 43210"
        officeLocation="BKC, Mumbai"
        photoUrl="/sample.jpg"
      />
    );

    expect(screen.getByText("Alex Jordan")).toBeDefined();
    expect(screen.getByText("Creative Director")).toBeDefined();
    expect(screen.getByText("Innovative Spaces")).toBeDefined();
  });

  it("renders interactive action links with correct destinations", () => {
    render(
      <DigitalCard
        name="Alex Jordan"
        designation="Creative Director"
        companyName="Innovative Spaces"
        phoneNumber="+91 98765 43210"
        officeLocation="BKC, Mumbai"
        photoUrl="/sample.jpg"
      />
    );

    const callLink = screen.getByRole("link", { name: /call/i });
    expect(callLink.getAttribute("href")).toBe("tel:+919876543210");

    const whatsappLink = screen.getByRole("link", { name: /whatsapp/i });
    expect(whatsappLink.getAttribute("href")).toBe("https://wa.me/919876543210");

    const locationLink = screen.getByRole("link", { name: /location/i });
    expect(locationLink.getAttribute("href")).toContain(
      "google.com/maps/search/?api=1&query=BKC%2C%20Mumbai"
    );
  });
});
