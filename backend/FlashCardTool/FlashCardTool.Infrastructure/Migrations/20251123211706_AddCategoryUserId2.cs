using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FlashCardTool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryUserId2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Name", "UserId" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2025, 11, 23, 20, 58, 47, 90, DateTimeKind.Local).AddTicks(3050), "Math", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2025, 11, 23, 20, 58, 47, 98, DateTimeKind.Local).AddTicks(9080), "Science", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2025, 11, 23, 20, 58, 47, 98, DateTimeKind.Local).AddTicks(9090), "History", new Guid("11111111-1111-1111-1111-111111111111") }
                });
        }
    }
}
