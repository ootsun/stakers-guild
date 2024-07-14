public class Attestation
{
    public MsgData[] data {get;set;}
    public class MsgData
    {
        public Data data {get;set;}
        public class Data
        {
            public SourceTarget source {get;set;}
            public SourceTarget target {get;set;}
            public class SourceTarget
            {
                public string epoch {get;set;}
                public string root {get;set;}
            }
        }
    }
}