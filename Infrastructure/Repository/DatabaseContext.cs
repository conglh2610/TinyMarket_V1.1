using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Text;
using Infrastructure.Domain;

namespace Infrastructure.Repository
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext()
            : base("name=DbContext")
        {
        }

        public IDbSet<Category> Categories { get; set; }
        public IDbSet<Posts> Posts { get; set; }
        public IDbSet<Users> Users { get; set; }
        public IDbSet<Photos> Photos { get; set; }
        public IDbSet<Region> Regions { get; set; }

        protected override void OnModelCreating(DbModelBuilder builder)
        {
            //Database.SetInitializer(new MigrateDatabaseToLatestVersion<DatabaseContext, Configuration>());
        }
    }


    
}
