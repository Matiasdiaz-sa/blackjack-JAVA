import java.util.*;

public class Player {
    private List<Card> hand = new ArrayList<>();

    public void addCard(Card card) {
        hand.add(card);
    }

    public int getScore() {
        int score = 0;
        int aces = 0;

        for (Card c : hand) {
            score += c.getValue();
            if (c.getValue() == 11) aces++;
        }

        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    public void showHand(boolean showAll) {
        for (int i = 0; i < hand.size(); i++) {
            if (!showAll && i == 0) {
                System.out.println("Carta oculta");
            } else {
                System.out.println(hand.get(i));
            }
        }
    }
}
