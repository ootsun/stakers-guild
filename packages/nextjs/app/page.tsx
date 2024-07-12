"use client";

import React from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="min-h-screen m-10">
      <header className="bg-black text-white py-6 flex px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">Staker Guild</h1>
          <p className="mt-2 text-lg">Empowering Ethereum Solo Stakers</p>
        </div>
        <Link href={"/register"} passHref className="btn btn-primary btn-md font-normal gap-1">
          Register
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <div className="space-y-6">
            <p className="text-lg">
              <strong className="font-semibold">Support and Incentivize Solo Stakers:</strong> Solo stakers are the
              backbone of Ethereum’s decentralized consensus. We provide financial incentives and resources to ensure
              their contributions are recognized and rewarded, allowing them to focus on what they do best: securing the
              network.
            </p>
            <p className="text-lg">
              <strong className="font-semibold">Promote Decentralization:</strong> By supporting solo stakers, we aim to
              enhance the decentralization of the Ethereum network. Our efforts help ensure that power remains
              distributed among many independent validators, reinforcing the core principles of blockchain technology.
            </p>
            <p className="text-lg">
              <strong className="font-semibold">Foster a Community of Stakers:</strong> Solo Staker Guild is not just
              about funding; it's about building a community. We bring together solo stakers to share knowledge,
              collaborate on best practices, and support each other in their staking journey.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-6">
            <p className="text-lg">
              <strong className="font-semibold">Membership:</strong> Join a community of like-minded solo stakers who
              are dedicated to the Ethereum network. Membership is open to all solo stakers who share our values and
              commitment to decentralization.
            </p>
            <p className="text-lg">
              <strong className="font-semibold">Funding and Incentives:</strong> We pool resources from donations,
              grants, and community contributions to provide financial support to solo stakers. Our funding model
              ensures that rewards are distributed fairly based on each staker’s contribution to the network.
            </p>
            <p className="text-lg">
              <strong className="font-semibold">Education and Resources:</strong> Access a wealth of resources designed
              to help you succeed as a solo staker. From technical guides to community forums, we provide the tools and
              knowledge you need to optimize your staking operations.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Join Us</h2>
          <div className="space-y-6">
            <p className="text-lg">
              Whether you're an experienced solo staker or just starting your journey, Solo Staker Guild is here to
              support you. Together, we can strengthen the Ethereum network and build a more decentralized future.
            </p>
            <p className="text-lg">
              <strong className="font-semibold">Get Involved:</strong> Join our community today and start making a
              difference. Explore our resources, apply for funding, and connect with fellow stakers who share your
              passion for Ethereum.
            </p>
            <p className="text-lg">
              <strong className="font-semibold">Donate:</strong> Support the Solo Staker Guild by making a donation.
              Your contributions help us provide financial incentives and resources to solo stakers, ensuring the
              continued decentralization and security of the Ethereum network.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
