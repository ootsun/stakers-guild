using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using System.Numerics;
using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Text.Json;
using System.Net.Http.Json;
using Nethereum.Hex.HexTypes;

[FunctionOutput]
public class GetGenesisBlockOutputDTO
{
    [Parameter("uint")]
    public BigInteger Number { get; set; }
}

[FunctionOutput]
public class GetRegisteredValidatorsOutputDTO
{
    [Parameter("uint32[]")]
    public List<uint> Numbers { get; set; }
}

class Program
{
    static async Task Main(string[] args)
    {
        // Connect to the local Hardhat network
        var nodeUrl = "http://127.0.0.1:8545";
        //its address is 0x8192fF7F913511624853dC30d67B01fbACa2936f and has to be funded for calling the endEpoch functions
        var account = new Account("0x0df368899a33d0ab16a93e21f6d1fdbbf30fefd21ef268179a7dfe38efa6ddbb");
        string pk = account.PrivateKey;
        var web3 = new Web3(account, nodeUrl);

        var contractJsonString = File.ReadAllText("../../packages/hardhat/deployments/localhost/YourContract.json");
        var yourContract = JsonSerializer.Deserialize<YourContract>(contractJsonString);
        var contract = web3.Eth.GetContract(JsonSerializer.Serialize(yourContract.Abi), yourContract.Address);

        var getGenesisBlockFunction = contract.GetFunction("genesisBlockNumber");
        bool startDonationHappened = false;
        while (!startDonationHappened)
        {
            Thread.Sleep(2000);
            var resultGetGenesisBlock = await getGenesisBlockFunction.CallDeserializingToObjectAsync<GetGenesisBlockOutputDTO>();
            Console.WriteLine($"GenesisBlockNumber = {resultGetGenesisBlock.Number}");
            startDonationHappened = resultGetGenesisBlock.Number != 0;
        }
        Console.WriteLine("Startdonation occurred");

        Console.WriteLine("Waiting for an epoch end");
        while (true)
        {
            HttpClient httpClient = new HttpClient 
            { 
                BaseAddress = new Uri("https://ultra-spring-dawn.quiknode.pro/a193b9a57b68aa32ff3b32e3a7eeaccc9e333385/"),
                Timeout =  TimeSpan.FromMinutes(5)
            };
            Task<Stream> stream = httpClient.GetStreamAsync("eth/v1/events?topics=head");
            HeadEvent? headEvent = null;
            using (var reader = new StreamReader(await stream))
            {
                while (!reader.EndOfStream)
                {
                    string line = await reader.ReadLineAsync();
                    while(!line.StartsWith("data"))
                    {
                        line = await reader.ReadLineAsync();
                    }
                    headEvent = JsonSerializer.Deserialize<HeadEvent>(line.Substring(5));
                    if(headEvent is not null && headEvent.EpochTransition)
                    {
                        break;
                    }
                }
            }

            Attestation attest = await httpClient.GetFromJsonAsync<Attestation>($"eth/v1/beacon/blocks/{headEvent.Slot}/attestations");
            string epoch = attest.data.FirstOrDefault().data.source.epoch;
            Console.WriteLine($"epoch {epoch} ended");

            var getRegisteredValidatorsFunction = contract.GetFunction("getRegisteredValidatorColl");
            var resultGetRegisteredValidators = await getRegisteredValidatorsFunction.CallDeserializingToObjectAsync<GetRegisteredValidatorsOutputDTO>();

            //seems like the ended epoch is not still available in the api, so take the previous
            HttpResponseMessage resp = await httpClient.PostAsJsonAsync($"eth/v1/beacon/rewards/attestations/{int.Parse(epoch) - 1}", 
                resultGetRegisteredValidators.Numbers.Select(x => $"{x}").ToArray());
            string cont = await resp.Content.ReadAsStringAsync();
            Reward reward = JsonSerializer.Deserialize<Reward>(cont);
            uint[] inactiveValidatorColl = reward.data.total_rewards.Where(x => x.inactivity != "0").Select(x => uint.Parse(x.validator_index)).ToArray();

            if(inactiveValidatorColl.Length > 0)
            {
                Console.WriteLine($"Calling contract function epochEnd for {inactiveValidatorColl.Length} inactive validators.");
                var processArrayFunction = contract.GetFunction("epochEnd");
                var transactionHash = await processArrayFunction.SendTransactionAsync(account.Address, new HexBigInteger(600000), null, inactiveValidatorColl);
                Console.WriteLine("Transaction hash: " + transactionHash);
            }
            else
            {
                Console.WriteLine("No validators have missed attestations, so not calling the contract to save gas.")
            }
        }
    }
}