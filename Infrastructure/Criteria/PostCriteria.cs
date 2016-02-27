using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Criteria
{
    public class PostCriteria : BaseCriteria
    {
        public string CategoryStringIds { get; set; }
        public int RegionId { get; set; }
        public int SearchText { get; set; }
        public int IsBuying { get; set; }
        public decimal PriceFrom { get; set; }
        public decimal PriceTo { get; set; }
        public decimal DateFrom { get; set; }
        public decimal DateTo { get; set; }
    }
}
