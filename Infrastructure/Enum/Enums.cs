using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Enum
{
    public class Enums
    {
        public enum Status
        {
            [Description("Còn Mới")]
            New = 1,
            [Description("Đã sử dụng")]
            SecondHand = 2
        }
    }
}
