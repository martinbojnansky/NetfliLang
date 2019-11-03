using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NetfliLang.Core.ViewModel;

namespace NetfliLang.Core.Navigation
{
    public interface INavigationPage<T> where T : ViewModelBase
    {
        T ViewModel { get; set; }
    }
}
