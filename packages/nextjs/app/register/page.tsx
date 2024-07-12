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
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Register</h1>
        <p className="text-neutral">Some explanation here</p>
        <RegisterForm contractName="YourContract" />
      </div>
    </>
  );
};

export default Register;
