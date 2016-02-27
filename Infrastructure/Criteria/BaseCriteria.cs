using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Criteria
{
    public class BaseCriteria
    {
        public int PageStart { get; set; }
        public int PageEnd { get; set; }
        public int OrderBy { get; set; }
        public bool IsDesc { get; set; }
    }
}
