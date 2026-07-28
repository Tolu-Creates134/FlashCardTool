using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlashCardTool.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTimestampToBaseEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "_Timestamp",
                table: "Users",
                newName: "Timestamp");

            migrationBuilder.RenameColumn(
                name: "_Timestamp",
                table: "FlashCards",
                newName: "Timestamp");

            migrationBuilder.RenameColumn(
                name: "_Timestamp",
                table: "Decks",
                newName: "Timestamp");

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "PractiseSessions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "Categories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "Timestamp",
                value: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "PractiseSessions");

            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "Categories");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "Users",
                newName: "_Timestamp");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "FlashCards",
                newName: "_Timestamp");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "Decks",
                newName: "_Timestamp");
        }
    }
}
