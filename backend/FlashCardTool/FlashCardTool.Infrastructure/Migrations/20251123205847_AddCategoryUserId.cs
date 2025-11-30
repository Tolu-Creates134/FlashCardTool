using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashCardTool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserKey",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "_Timestamp",
                table: "Categories",
                newName: "CreatedAt");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "UserId" },
                values: new object[] { new DateTime(2025, 11, 23, 20, 58, 47, 90, DateTimeKind.Local).AddTicks(3050), new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CreatedAt", "UserId" },
                values: new object[] { new DateTime(2025, 11, 23, 20, 58, 47, 98, DateTimeKind.Local).AddTicks(9080), new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "UserId" },
                values: new object[] { new DateTime(2025, 11, 23, 20, 58, 47, 98, DateTimeKind.Local).AddTicks(9090), new Guid("11111111-1111-1111-1111-111111111111") });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_UserId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Categories");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Categories",
                newName: "_Timestamp");

            migrationBuilder.AddColumn<Guid>(
                name: "UserKey",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "_Timestamp",
                value: new DateTime(2025, 10, 22, 20, 22, 43, 617, DateTimeKind.Local).AddTicks(5940));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "_Timestamp",
                value: new DateTime(2025, 10, 22, 20, 22, 43, 626, DateTimeKind.Local).AddTicks(5770));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "_Timestamp",
                value: new DateTime(2025, 10, 22, 20, 22, 43, 626, DateTimeKind.Local).AddTicks(5800));
        }
    }
}
