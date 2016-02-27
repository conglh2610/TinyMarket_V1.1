using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Domain
{
    public class Photos
    {
        [Key]
        public int Id { get; set; }
        public string Path { get; set; }
    }
}
