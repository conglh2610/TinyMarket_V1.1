using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TinyMarket.Web.Models
{
    public class CategoryDetail
    {
        public int Id { get; set; }
        public int Name { get; set; }

        public string Image { get; set; }
        public int CategoryId { get; set; }
    }
}