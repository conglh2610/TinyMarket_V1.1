namespace Infrastructure.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class abc : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.Posts", "PostCode");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Posts", "PostCode", c => c.String());
        }
    }
}
