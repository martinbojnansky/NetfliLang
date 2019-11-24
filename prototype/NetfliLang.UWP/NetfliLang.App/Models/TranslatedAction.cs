using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace UWPToolkit.Template.Models
{
    [DataContract]
    public class TranslatedAction
    {
        [DataMember]
        public string value { get; set; }

        [DataMember]
        public string translation { get; set; }
    }
}
