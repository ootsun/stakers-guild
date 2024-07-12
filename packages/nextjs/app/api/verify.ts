import { type IVerifyResponse, verifyCloudProof } from '@worldcoin/idkit'
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const proof = req.body
    const app_id = "app_staging_b98a7bb6eed48c29f711c1a58dd1afca"
    const action = "register"
    const verifyRes = (await verifyCloudProof(proof, app_id, action)) as IVerifyResponse

    if (verifyRes.success) {
        // This is where you should perform backend actions if the verification succeeds
        // Such as, setting a user as "verified" in a database
        res.status(200).send(verifyRes);
    } else {
        // This is where you should handle errors from the World ID /verify endpoint.
        // Usually these errors are due to a user having already verified.
        res.status(400).send(verifyRes);
    }
};
