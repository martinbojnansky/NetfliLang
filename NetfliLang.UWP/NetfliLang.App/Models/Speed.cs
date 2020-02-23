using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NetfliLang.App.Models
{
    public class Speed
    {
        public double Rate { get; set; }
        public string Label { get; set; }

        public Speed(double rate, string label)
        {
            Rate = rate;
            Label = label;
        }
    }
}
