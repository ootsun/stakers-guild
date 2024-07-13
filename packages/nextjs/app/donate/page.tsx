import React from "react";
import {DonateForm} from "./_components/DonateForm";
import {NextPage} from "next";
import {getMetadata} from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
    title: "Donate",
    description: "Donate ETH to the project",
});

const Donate: NextPage = () => {
    return (
        <div className="text-center mt-8 p-10">
            <h1 className="text-4xl my-0">Donate</h1>
            <p className="text-neutral"><strong className="font-semibold">Support and Incentivize Solo
                Stakers:</strong> Solo stakers are the
                backbone of Ethereum’s decentralized consensus. We provide financial incentives and resources to ensure
                their contributions are recognized and rewarded, allowing them to focus on what they do best: securing
                the
                network.</p>
            <DonateForm contractName="YourContract"/>
        </div>
    );
};

export default Donate;
