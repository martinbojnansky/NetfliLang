using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace UWPToolkit.Template.Models
{
    [DataContract]
    public class TranslateAction
    {
        [DataMember]
        public string key { get; set; }

        [DataMember]
        public string[] lines { get; set; }
    }
}
