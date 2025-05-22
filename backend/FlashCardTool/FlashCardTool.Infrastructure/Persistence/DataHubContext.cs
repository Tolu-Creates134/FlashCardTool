using System;
using FlashCardTool.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Infrastructure.Persistence;

public class DataHubContext(DbContextOptions<DataHubContext> options) : DbContext(options)
{

    public DbSet<Category> Categories { get; init; }

    public DbSet<Deck> Decks{ get; init; }

    public DbSet<FlashCard> FlashCards{ get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>()
        .HasMany(c => c.Decks)
        .WithOne(d => d.Category)
        .HasForeignKey(d => d.CategoryId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Deck>()
        .HasMany(d => d.Flashcards)
        .WithOne(f => f.Deck)
        .HasForeignKey(f => f.DeckId)
        .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Math" },
            new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Science" },
            new Category { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "History" }
        );
        
    }

}
