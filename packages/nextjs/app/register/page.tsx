import React from "react";
import { RegisterForm } from "./_components/RegisterForm";
import { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Register",
  description: "Register your validator node",
});

const Register: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 p-10">
        <h1 className="text-4xl my-0">Register</h1>
        <p className="text-neutral"><strong className="font-semibold">Membership:</strong> Join a community of like-minded solo stakers who
            are dedicated to the Ethereum network. Membership is open to all solo stakers who share our values and
            commitment to decentralization.</p>
        <RegisterForm contractName="YourContract" />
      </div>
    </>
  );
};

export default Register;
