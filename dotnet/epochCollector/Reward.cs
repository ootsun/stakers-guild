public class Reward 
{
    public Data data {get;set;}
    public class Data
    {
        public TotalReward[] total_rewards {get;set;}
        public class TotalReward
        {
            public string inactivity {get;set;}
            public string validator_index {get;set;}
        }
    }
}