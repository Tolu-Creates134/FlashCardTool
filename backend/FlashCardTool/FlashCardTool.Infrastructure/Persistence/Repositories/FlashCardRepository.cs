using FlashCardTool.Domain.Interfaces;

namespace FlashCardTool.Infrastructure.Persistence.Repositories;

public class FlashCardRepository : IFlashCardRepository
{
    private DataHubContext context;

    public FlashCardRepository(DataHubContext context)
    {
        this.context = context;
    }
}
